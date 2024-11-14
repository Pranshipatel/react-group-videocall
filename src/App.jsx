import React, { useEffect, useState } from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import './index.css';

// Utility function to generate a random ID for user and room
function randomID(len) {
  let result = '';
  const chars = '12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP';
  const maxPos = chars.length;
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return result;
}

// Utility function to get URL parameters
function getUrlParams(url = window.location.href) {
  let urlStr = url.split('?')[1];
  return new URLSearchParams(urlStr);
}

// Fetch token from server
function generateToken(tokenServerUrl, userID) {
  return fetch(`${tokenServerUrl}/access_token?userID=${userID}&expired_ts=7200`, {
    method: 'GET',
  })
    .then((res) => res.json())
    .then((data) => data.token)
    .catch((error) => {
      console.error("Error generating token:", error);
      return null;
    });
}

export default function App() {
  const roomID = getUrlParams().get('roomID') || randomID(5); // Default to random ID if no roomID in URL
  const [loading, setLoading] = useState(true); // To manage the loading state

  // Function to initialize the video call
  const myMeeting = async (element) => {
    const userID = randomID(5); // Random user ID
    const userName = randomID(5); // Random user name

    // Fetch token and initialize Zego UI
    generateToken('https://nextjs-token.vercel.app/api', userID).then((tokenResponse) => {
      if (tokenResponse) {
        const token = ZegoUIKitPrebuilt.generateKitTokenForProduction(
          1484647939, // App ID (replace with actual app ID)
          tokenResponse, // Token
          roomID, // Room ID
          userID, // User ID
          userName // User Name
        );

        const zp = ZegoUIKitPrebuilt.create(token); // Create Zego instance

        // Join room and initialize UI
        zp.joinRoom({
          container: element,
          sharedLinks: [
            {
              name: 'Personal link',
              url: `${window.location.origin}${window.location.pathname}?roomID=${roomID}`,
            },
          ],
          scenario: {
            mode: ZegoUIKitPrebuilt.VideoConference, // Video Conference Mode
          },
        });

        setLoading(false); // Set loading to false once video call is initialized
      } else {
        console.error('Failed to fetch token.');
        setLoading(false);
      }
    });
  };

  return (
    <div>
      {/* Loading state, show message while video call is being set up */}
      {loading && <div>Loading video call...</div>}

      {/* Video call container */}
      <div
        className="myCallContainer"
        ref={myMeeting}
        style={{ width: '100vw', height: '100vh' }}
      ></div>
    </div>
  );
}
