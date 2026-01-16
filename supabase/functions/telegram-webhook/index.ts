/**
 * Telegram Webhook Handler
 * Receives and processes messages from Telegram Bot API
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createAdminClient, getVendorBySlug, getVendorByTelegramBusinessConnection } from "../_shared/supabase.ts";
import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { sendMessage, requestContact, answerCallbackQuery, type TelegramUpdate, type TelegramMessage } from "../_shared/telegram.ts";
import { buildSystemPrompt, createChatCompletion, AI_TOOLS } from "../_shared/openai.ts";

serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Verify webhook secret (optional but recommended)
    const url = new URL(req.url);
    const secret = url.searchParams.get("secret");
    const expectedSecret = Deno.env.get("TELEGRAM_WEBHOOK_SECRET");

    if (expectedSecret && secret !== expectedSecret) {
      return errorResponse("Unauthorized", 401);
    }

    // Parse update
    const update: TelegramUpdate = await req.json();
    console.log("Received update:", JSON.stringify(update, null, 2));

    const supabase = createAdminClient();

    // Handle different update types
    if (update.business_connection) {
      // Handle Telegram Business connection
      await handleBusinessConnection(supabase, update.business_connection);
    } else if (update.business_message) {
      // Handle message from Telegram Business
      await handleBusinessMessage(supabase, update.business_message);
    } else if (update.message) {
      // Handle regular bot message
      await handleBotMessage(supabase, update.message);
    } else if (update.callback_query) {
      // Handle inline button callback
      await handleCallbackQuery(supabase, update.callback_query);
    }

    return jsonResponse({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return errorResponse(error.message, 500);
  }
});

/**
 * Handle Telegram Business connection/disconnection
 */
async function handleBusinessConnection(
  supabase: ReturnType<typeof createAdminClient>,
  connection: TelegramUpdate["business_connection"]
) {
  if (!connection) return;

  console.log("Business connection:", connection);

  // TODO: Store/remove business connection in vendor record
  // This would be triggered when vendor connects/disconnects bot in Telegram settings
}

/**
 * Handle message from Telegram Business (vendor's personal account)
 */
async function handleBusinessMessage(
  supabase: ReturnType<typeof createAdminClient>,
  message: TelegramMessage
) {
  const businessConnectionId = message.business_connection_id;
  if (!businessConnectionId) return;

  // Find vendor by business connection
  const vendor = await getVendorByTelegramBusinessConnection(supabase, businessConnectionId);
  if (!vendor) {
    console.error("Vendor not found for business connection:", businessConnectionId);
    return;
  }

  await processMessage(supabase, message, vendor);
}

/**
 * Handle regular bot message (aggregator bot)
 */
async function handleBotMessage(
  supabase: ReturnType<typeof createAdminClient>,
  message: TelegramMessage
) {
  const chatId = message.chat.id;
  const text = message.text || "";

  // Handle /start command with vendor slug
  if (text.startsWith("/start")) {
    const parts = text.split(" ");
    const vendorSlug = parts[1];

    if (vendorSlug) {
      const vendor = await getVendorBySlug(supabase, vendorSlug);
      if (vendor) {
        // Store vendor context for this chat
        await supabase.from("conversations").upsert({
          vendor_id: vendor.id,
          platform: "telegram",
          platform_chat_id: chatId.toString(),
          context: { vendor_slug: vendorSlug },
          is_active: true,
        }, {
          onConflict: "vendor_id,platform,platform_chat_id",
        });

        await sendMessage(
          chatId,
          `Привет! Я ассистент *${vendor.business_name}*.\n\nЧем могу помочь? Напишите, на какую услугу хотите записаться.`,
          { parseMode: "Markdown" }
        );
        return;
      }
    }

    // No vendor specified
    await sendMessage(
      chatId,
      "Привет! Чтобы записаться к мастеру, перейдите по его персональной ссылке или QR-коду."
    );
    return;
  }

  // Find active conversation to get vendor context
  const { data: conversation } = await supabase
    .from("conversations")
    .select("*, vendors(*)")
    .eq("platform", "telegram")
    .eq("platform_chat_id", chatId.toString())
    .eq("is_active", true)
    .single();

  if (!conversation?.vendors) {
    await sendMessage(
      chatId,
      "Для записи к мастеру, пожалуйста, перейдите по его персональной ссылке."
    );
    return;
  }

  await processMessage(supabase, message, conversation.vendors);
}

/**
 * Process message with AI
 */
async function processMessage(
  supabase: ReturnType<typeof createAdminClient>,
  message: TelegramMessage,
  vendor: { id: string; business_name: string; timezone: string; currency: string; ai_config: Record<string, unknown> }
) {
  const chatId = message.chat.id;
  const userId = message.from?.id;
  const userName = [message.from?.first_name, message.from?.last_name].filter(Boolean).join(" ");
  const userMessage = message.text || "";

  // Handle contact share
  if (message.contact) {
    await handleContactShare(supabase, message, vendor);
    return;
  }

  // Skip if no text
  if (!userMessage) return;

  try {
    // Get or create client
    let client = await getOrCreateClient(supabase, vendor.id, userId, userName);

    // Get or create conversation
    const { data: conversation } = await supabase
      .from("conversations")
      .upsert({
        vendor_id: vendor.id,
        client_id: client?.id,
        platform: "telegram",
        platform_chat_id: chatId.toString(),
        is_active: true,
        last_message_at: new Date().toISOString(),
      }, {
        onConflict: "vendor_id,platform,platform_chat_id",
      })
      .select()
      .single();

    if (!conversation) {
      throw new Error("Failed to get/create conversation");
    }

    // Get message history
    const { data: history } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: false })
      .limit(10);

    // Get services for context
    const { data: services } = await supabase
      .from("services")
      .select("id, name, price, duration_minutes, category")
      .eq("vendor_id", vendor.id)
      .eq("is_active", true);

    // Build messages for AI
    const systemPrompt = buildSystemPrompt({
      business_name: vendor.business_name,
      timezone: vendor.timezone,
      currency: vendor.currency,
      ai_config: vendor.ai_config as any,
      services: services || [],
    });

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...(history || []).reverse().map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: userMessage },
    ];

    // Save user message
    await supabase.from("messages").insert({
      conversation_id: conversation.id,
      role: "user",
      content: userMessage,
    });

    // Call AI
    const completion = await createChatCompletion(messages, AI_TOOLS);
    const assistantMessage = completion.choices[0].message;

    // Handle function calls
    if (assistantMessage.tool_calls) {
      for (const toolCall of assistantMessage.tool_calls) {
        const result = await executeToolCall(
          supabase,
          vendor.id,
          toolCall.function.name,
          JSON.parse(toolCall.function.arguments),
          userId,
          conversation.id
        );

        // Send result back to AI for final response
        messages.push({
          role: "assistant" as const,
          content: "",
          // tool_calls: assistantMessage.tool_calls,
        } as any);
        messages.push({
          role: "tool" as any,
          content: JSON.stringify(result),
          tool_call_id: toolCall.id,
        } as any);
      }

      // Get final response after tool execution
      const finalCompletion = await createChatCompletion(messages, AI_TOOLS);
      const finalResponse = finalCompletion.choices[0].message.content || "";

      await sendMessage(chatId, finalResponse);

      // Save assistant message
      await supabase.from("messages").insert({
        conversation_id: conversation.id,
        role: "assistant",
        content: finalResponse,
        tokens_used: (completion.usage?.total_tokens || 0) + (finalCompletion.usage?.total_tokens || 0),
        model_used: "gpt-4o",
      });

    } else {
      // No function calls, just send response
      const response = assistantMessage.content || "Извините, не понял вас. Попробуйте переформулировать.";
      await sendMessage(chatId, response);

      // Save assistant message
      await supabase.from("messages").insert({
        conversation_id: conversation.id,
        role: "assistant",
        content: response,
        tokens_used: completion.usage?.total_tokens || 0,
        model_used: "gpt-4o",
      });
    }

    // Update AI tokens used
    const tokensUsed = completion.usage?.total_tokens || 0;
    await supabase.rpc("increment_ai_tokens", {
      p_vendor_id: vendor.id,
      p_tokens: tokensUsed,
    });

  } catch (error) {
    console.error("Error processing message:", error);
    await sendMessage(
      chatId,
      "Произошла ошибка. Пожалуйста, попробуйте ещё раз или свяжитесь с мастером напрямую."
    );
  }
}

/**
 * Handle contact share from user
 */
async function handleContactShare(
  supabase: ReturnType<typeof createAdminClient>,
  message: TelegramMessage,
  vendor: { id: string }
) {
  const chatId = message.chat.id;
  const contact = message.contact!;
  const userId = message.from?.id;

  // Update client with phone
  if (userId) {
    await supabase
      .from("clients")
      .update({ phone: contact.phone_number })
      .eq("vendor_id", vendor.id)
      .eq("telegram_id", userId);
  }

  await sendMessage(
    chatId,
    `Спасибо! Номер ${contact.phone_number} сохранён. Теперь можем продолжить запись.`
  );
}

/**
 * Handle callback query (inline button press)
 */
async function handleCallbackQuery(
  supabase: ReturnType<typeof createAdminClient>,
  query: TelegramUpdate["callback_query"]
) {
  if (!query) return;

  await answerCallbackQuery(query.id);

  const data = query.data;
  if (!data) return;

  // Parse callback data
  const [action, ...params] = data.split(":");

  switch (action) {
    case "select_time":
      // Handle time selection
      break;
    case "confirm_booking":
      // Handle booking confirmation
      break;
    case "cancel":
      // Handle cancellation
      break;
  }
}

/**
 * Get or create client by telegram_id
 */
async function getOrCreateClient(
  supabase: ReturnType<typeof createAdminClient>,
  vendorId: string,
  telegramId: number | undefined,
  name: string
) {
  if (!telegramId) return null;

  const { data: existing } = await supabase
    .from("clients")
    .select("*")
    .eq("vendor_id", vendorId)
    .eq("telegram_id", telegramId)
    .single();

  if (existing) return existing;

  const { data: created } = await supabase
    .from("clients")
    .insert({
      vendor_id: vendorId,
      telegram_id: telegramId,
      name,
    })
    .select()
    .single();

  return created;
}

/**
 * Execute AI tool call
 */
async function executeToolCall(
  supabase: ReturnType<typeof createAdminClient>,
  vendorId: string,
  functionName: string,
  args: Record<string, unknown>,
  userId: number | undefined,
  conversationId: string
): Promise<unknown> {
  console.log(`Executing tool: ${functionName}`, args);

  switch (functionName) {
    case "get_services": {
      const { data } = await supabase
        .from("services")
        .select("id, name, price, duration_minutes, description, category")
        .eq("vendor_id", vendorId)
        .eq("is_active", true);

      return { services: data || [] };
    }

    case "check_availability": {
      const { service_id, date, time_preference } = args as {
        service_id: string;
        date: string;
        time_preference?: string;
      };

      const { data } = await supabase.rpc("get_available_slots", {
        p_vendor_id: vendorId,
        p_service_id: service_id,
        p_date: date,
      });

      // Filter by time preference
      let slots = (data || []).map((s: { slot_time: string }) =>
        new Date(s.slot_time).toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );

      if (time_preference && time_preference !== "any") {
        const ranges: Record<string, [number, number]> = {
          morning: [9, 12],
          afternoon: [12, 17],
          evening: [17, 21],
        };
        const [start, end] = ranges[time_preference] || [0, 24];
        slots = slots.filter((time: string) => {
          const hour = parseInt(time.split(":")[0]);
          return hour >= start && hour < end;
        });
      }

      return { date, available_slots: slots };
    }

    case "create_booking": {
      const { service_id, datetime, client_phone, client_name } = args as {
        service_id: string;
        datetime: string;
        client_phone: string;
        client_name?: string;
      };

      // Get service details
      const { data: service } = await supabase
        .from("services")
        .select("*")
        .eq("id", service_id)
        .single();

      if (!service) {
        return { error: "Услуга не найдена" };
      }

      // Get or create client
      const { data: client } = await supabase
        .from("clients")
        .upsert({
          vendor_id: vendorId,
          phone: client_phone,
          name: client_name,
          telegram_id: userId,
        }, {
          onConflict: "vendor_id,phone",
        })
        .select()
        .single();

      // Calculate end time
      const startTime = new Date(datetime);
      const endTime = new Date(startTime.getTime() + service.duration_minutes * 60 * 1000);

      // Create booking
      const { data: booking, error } = await supabase
        .from("bookings")
        .insert({
          vendor_id: vendorId,
          client_id: client?.id,
          service_id,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          status: "confirmed",
          source: "telegram",
          price: service.price,
        })
        .select()
        .single();

      if (error) {
        return { error: "Не удалось создать запись" };
      }

      return {
        success: true,
        booking_id: booking.id,
        service_name: service.name,
        datetime: startTime.toLocaleString("ru-RU"),
      };
    }

    case "get_booking_info": {
      const { data } = await supabase
        .from("bookings")
        .select(`
          id,
          start_time,
          status,
          services(name, price)
        `)
        .eq("vendor_id", vendorId)
        .eq("clients.telegram_id", userId)
        .gte("start_time", new Date().toISOString())
        .order("start_time");

      return { bookings: data || [] };
    }

    case "cancel_booking": {
      const { booking_id, reason } = args as {
        booking_id: string;
        reason?: string;
      };

      const { error } = await supabase
        .from("bookings")
        .update({
          status: "cancelled",
          cancellation_reason: reason,
        })
        .eq("id", booking_id);

      if (error) {
        return { error: "Не удалось отменить запись" };
      }

      return { success: true };
    }

    default:
      return { error: `Unknown function: ${functionName}` };
  }
}
