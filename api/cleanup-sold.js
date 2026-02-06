import { createClient } from '@supabase/supabase-js';

// Cleanup sold vehicles older than 7 days
// This endpoint should be called via a cron job (e.g., Vercel Cron, GitHub Actions)

export default async function handler(req, res) {
    console.log('=== Cleanup Sold Vehicles Started ===');

    // Only allow POST or GET (for cron services)
    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Optional: Add a secret key for security
    const authKey = req.headers['x-cleanup-key'] || req.query.key;
    const expectedKey = process.env.CLEANUP_SECRET_KEY;

    if (expectedKey && authKey !== expectedKey) {
        console.error('Unauthorized cleanup attempt');
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const SUPABASE_URL = process.env.SUPABASE_URL;
        const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

        if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
            throw new Error('Missing Supabase configuration');
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

        // Calculate cutoff date (7 days ago)
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 7);
        const cutoffISO = cutoffDate.toISOString();

        console.log('Cutoff date:', cutoffISO);

        // Find sold vehicles older than 7 days
        const { data: oldSoldVehicles, error: fetchError } = await supabase
            .from('vehicles')
            .select('hexon_nr')
            .eq('status', 'sold')
            .lt('sold_at', cutoffISO);

        if (fetchError) {
            console.error('Fetch error:', fetchError);
            throw fetchError;
        }

        console.log('Found vehicles to cleanup:', oldSoldVehicles?.length || 0);

        if (!oldSoldVehicles || oldSoldVehicles.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No sold vehicles to cleanup',
                deleted: 0
            });
        }

        // Delete images from storage and vehicles from database
        let deletedCount = 0;

        for (const vehicle of oldSoldVehicles) {
            const hexonNr = vehicle.hexon_nr;
            console.log('Cleaning up vehicle:', hexonNr);

            // Delete image from storage
            const { error: storageError } = await supabase.storage
                .from('sold-vehicles')
                .remove([`${hexonNr}.jpg`]);

            if (storageError) {
                console.error('Storage delete error for', hexonNr, ':', storageError);
                // Continue anyway - image might not exist
            }

            // Delete vehicle from database
            const { error: deleteError } = await supabase
                .from('vehicles')
                .delete()
                .eq('hexon_nr', hexonNr);

            if (deleteError) {
                console.error('Database delete error for', hexonNr, ':', deleteError);
            } else {
                deletedCount++;
            }
        }

        console.log('=== Cleanup Complete ===');
        console.log('Deleted:', deletedCount, 'vehicles');

        return res.status(200).json({
            success: true,
            message: `Cleaned up ${deletedCount} sold vehicles`,
            deleted: deletedCount
        });

    } catch (error) {
        console.error('Cleanup failed:', error.message);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
