// utils/cloudStorage.js
// Utility functions for Google Cloud Storage operations
// Professional-grade file management in the cloud

import { Storage } from '@google-cloud/storage';
import path from 'path';

const storage = new Storage({
  projectId: 'goio-imperios-prod'
});

const BUCKETS = {
  reports: 'goio-reports-prod',
  temp: 'goio-temp-prod',
  backups: 'goio-backups-prod'
};

/**
 * Save a report to Cloud Storage
 * @param {string} filename - Name of the file (e.g., "found_trends-2025-10-19.json")
 * @param {Object} data - JSON data to save
 * @param {string} subfolder - Optional subfolder (e.g., "research", "creative")
 * @returns {Promise<string>} - Public URL of the saved file
 */
export async function saveReport(filename, data, subfolder = '') {
  try {
    const bucket = storage.bucket(BUCKETS.reports);
    const filePath = subfolder ? `${subfolder}/${filename}` : filename;
    const file = bucket.file(filePath);
    
    const jsonData = JSON.stringify(data, null, 2);
    await file.save(jsonData, {
      contentType: 'application/json',
      metadata: {
        cacheControl: 'public, max-age=3600',
      }
    });
    
    console.log(`📦 [CloudStorage] Saved to gs://${BUCKETS.reports}/${filePath}`);
    return `gs://${BUCKETS.reports}/${filePath}`;
  } catch (error) {
    console.error(`❌ [CloudStorage] Error saving ${filename}:`, error.message);
    throw error;
  }
}

/**
 * Load a report from Cloud Storage
 * @param {string} filename - Name of the file to load
 * @param {string} subfolder - Optional subfolder
 * @returns {Promise<Object>} - Parsed JSON data
 */
export async function loadReport(filename, subfolder = '') {
  try {
    const bucket = storage.bucket(BUCKETS.reports);
    const filePath = subfolder ? `${subfolder}/${filename}` : filename;
    const file = bucket.file(filePath);
    
    const [content] = await file.download();
    const data = JSON.parse(content.toString('utf-8'));
    
    console.log(`📥 [CloudStorage] Loaded from gs://${BUCKETS.reports}/${filePath}`);
    return data;
  } catch (error) {
    if (error.code === 404) {
      console.warn(`⚠️  [CloudStorage] File not found: ${filename}`);
      return null;
    }
    console.error(`❌ [CloudStorage] Error loading ${filename}:`, error.message);
    throw error;
  }
}

/**
 * Save temporary data (will be auto-deleted after 7 days)
 * @param {string} filename - Name of the temp file
 * @param {Object} data - Data to save
 * @returns {Promise<string>} - File path
 */
export async function saveTempData(filename, data) {
  try {
    const bucket = storage.bucket(BUCKETS.temp);
    const file = bucket.file(filename);
    
    const jsonData = JSON.stringify(data, null, 2);
    await file.save(jsonData, {
      contentType: 'application/json',
      metadata: {
        cacheControl: 'no-cache',
        // Auto-delete after 7 days
        customTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    });
    
    console.log(`💾 [CloudStorage] Temp saved: ${filename} (auto-delete in 7 days)`);
    return `gs://${BUCKETS.temp}/${filename}`;
  } catch (error) {
    console.error(`❌ [CloudStorage] Error saving temp ${filename}:`, error.message);
    throw error;
  }
}

/**
 * Create a backup of critical data
 * @param {string} backupName - Name for the backup (e.g., "backup-2025-10-19")
 * @param {Object} data - Data to backup
 * @returns {Promise<string>} - Backup file path
 */
export async function createBackup(backupName, data) {
  try {
    const bucket = storage.bucket(BUCKETS.backups);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${backupName}-${timestamp}.json`;
    const file = bucket.file(filename);
    
    const jsonData = JSON.stringify(data, null, 2);
    await file.save(jsonData, {
      contentType: 'application/json',
      metadata: {
        backupDate: new Date().toISOString(),
        backupType: 'automated'
      }
    });
    
    console.log(`🔒 [CloudStorage] Backup created: ${filename}`);
    return `gs://${BUCKETS.backups}/${filename}`;
  } catch (error) {
    console.error(`❌ [CloudStorage] Error creating backup:`, error.message);
    throw error;
  }
}

/**
 * List all files in a bucket with optional prefix filter
 * @param {string} bucketType - 'reports', 'temp', or 'backups'
 * @param {string} prefix - Optional prefix filter (e.g., "research/")
 * @returns {Promise<Array>} - List of file objects
 */
export async function listFiles(bucketType = 'reports', prefix = '') {
  try {
    const bucketName = BUCKETS[bucketType];
    const bucket = storage.bucket(bucketName);
    
    const [files] = await bucket.getFiles({ prefix });
    
    const fileList = files.map(file => ({
      name: file.name,
      size: file.metadata.size,
      created: file.metadata.timeCreated,
      updated: file.metadata.updated,
      url: `gs://${bucketName}/${file.name}`
    }));
    
    console.log(`📂 [CloudStorage] Found ${fileList.length} files in ${bucketName}/${prefix}`);
    return fileList;
  } catch (error) {
    console.error(`❌ [CloudStorage] Error listing files:`, error.message);
    throw error;
  }
}

/**
 * Delete old files (cleanup utility)
 * @param {string} bucketType - 'reports', 'temp', or 'backups'
 * @param {number} daysOld - Delete files older than this many days
 * @returns {Promise<number>} - Number of files deleted
 */
export async function cleanupOldFiles(bucketType = 'temp', daysOld = 30) {
  try {
    const bucketName = BUCKETS[bucketType];
    const bucket = storage.bucket(bucketName);
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const [files] = await bucket.getFiles();
    let deletedCount = 0;
    
    for (const file of files) {
      const fileDate = new Date(file.metadata.timeCreated);
      if (fileDate < cutoffDate) {
        await file.delete();
        deletedCount++;
        console.log(`🗑️  [CloudStorage] Deleted old file: ${file.name}`);
      }
    }
    
    console.log(`✅ [CloudStorage] Cleanup complete: ${deletedCount} files deleted`);
    return deletedCount;
  } catch (error) {
    console.error(`❌ [CloudStorage] Error during cleanup:`, error.message);
    throw error;
  }
}

export default {
  saveReport,
  loadReport,
  saveTempData,
  createBackup,
  listFiles,
  cleanupOldFiles
};
