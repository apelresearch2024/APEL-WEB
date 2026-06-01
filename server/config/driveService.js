import { google } from 'googleapis';
import { Readable } from 'stream';

let driveClient = null;

export const initDriveService = async () => {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GD_CLIENT_ID,
      process.env.GD_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GD_REFRESH_TOKEN
    });

    driveClient = google.drive({ version: 'v3', auth: oauth2Client });
    console.log("✅ Google Drive Authenticated cleanly via User Storage Quota.");
  } catch (error) {
    console.error("❌ Failed to initialize Google Drive via OAuth:", error.message);
    throw error;
  }
};

export const uploadPdfToDrive = async (fileBuffer, originalName, mimeType) => {
  try {
    if (!driveClient) throw new Error("Drive client not ready.");

    const folderId = process.env.GD_FOLDER_ID;
    const fileMetadata = {
      name: originalName || `Asset_${Date.now()}`,
      ...(folderId && { parents: [folderId] })
    };

    const bufferStream = new Readable();
    bufferStream.push(fileBuffer);
    bufferStream.push(null);

    const media = { mimeType: mimeType || 'application/octet-stream', body: bufferStream };

    const response = await driveClient.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink'
    });

    // Make file public
    await driveClient.permissions.create({
      fileId: response.data.id,
      requestBody: { role: 'reader', type: 'anyone' },
    });

    return response.data;
  } catch (error) {
    console.error("❌ Google Drive Upload Exception:", error);
    throw error;
  }
};
export const deleteFileFromDrive = async (fileId) => {
    return await driveClient.files.delete({ fileId });
};