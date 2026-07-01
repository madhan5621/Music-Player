import { generateStreamUrl } from '../utils/driveUtils.js';

export const streamAudio = async (req, res) => {
  try {
    const { fileId } = req.params;
    
    if (!fileId || fileId.length < 25) {
      return res.status(400).json({ message: 'Invalid file ID' });
    }

    const driveUrl = generateStreamUrl(fileId);

    // Fetch the file from Google Drive, following redirects
    const response = await fetch(driveUrl, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      // Try to handle the virus scan confirmation page
      const text = await response.text();
      
      // Check for the confirmation page and extract the confirm token
      const confirmMatch = text.match(/confirm=([0-9A-Za-z_-]+)/);
      if (confirmMatch) {
        const confirmUrl = `${driveUrl}&confirm=${confirmMatch[1]}`;
        const confirmedResponse = await fetch(confirmUrl, {
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (!confirmedResponse.ok) {
          return res.status(502).json({ message: 'Failed to fetch audio from Google Drive' });
        }

        res.set({
          'Content-Type': confirmedResponse.headers.get('content-type') || 'audio/mpeg',
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=86400'
        });
        
        const contentLength = confirmedResponse.headers.get('content-length');
        if (contentLength) res.set('Content-Length', contentLength);

        const reader = confirmedResponse.body.getReader();
        const pump = async () => {
          while (true) {
            const { done, value } = await reader.read();
            if (done) { res.end(); return; }
            res.write(Buffer.from(value));
          }
        };
        return pump();
      }
      
      return res.status(502).json({ message: 'Failed to fetch audio from Google Drive' });
    }

    // Set appropriate headers for audio streaming
    res.set({
      'Content-Type': response.headers.get('content-type') || 'audio/mpeg',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*'
    });

    const contentLength = response.headers.get('content-length');
    if (contentLength) res.set('Content-Length', contentLength);

    // Handle range requests for seeking
    const range = req.headers.range;
    if (range && contentLength) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : parseInt(contentLength) - 1;
      
      res.status(206);
      res.set({
        'Content-Range': `bytes ${start}-${end}/${contentLength}`,
        'Content-Length': end - start + 1
      });
    }

    // Stream the response
    const reader = response.body.getReader();
    const pump = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) { res.end(); return; }
          if (!res.writableEnded) {
            res.write(Buffer.from(value));
          }
        }
      } catch (err) {
        if (!res.writableEnded) res.end();
      }
    };
    
    req.on('close', () => {
      reader.cancel();
    });
    
    pump();
  } catch (error) {
    console.error('Stream error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Stream error', error: error.message });
    }
  }
};
