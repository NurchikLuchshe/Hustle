import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const supabase = createClient()

        // Проверяем подключение к БД
        const { data, error } = await supabase
            .from('vendors')
            .select('count')
            .limit(1)

        if (error) {
            return NextResponse.json({
                status: 'error',
                message: 'Database connection failed',
                error: error.message
            }, { status: 500 })
        }

        return NextResponse.json({
            status: 'success',
            message: 'Supabase connection established',
            database: 'connected',
            timestamp: new Date().toISOString()
        })
    } catch (err) {
        return NextResponse.json({
            status: 'error',
            message: 'Server error',
            error: err instanceof Error ? err.message : 'Unknown error'
        }, { status: 500 })
    }
}
