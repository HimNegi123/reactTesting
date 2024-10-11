import React, { useState } from 'react';
import './App.css';

function App() {
  const [responseData, setResponseData] = useState('');
  const [loading, setLoading] = useState(false);

  const formatResponseData = (data) => {
    return JSON.stringify(data, null, 2).replace(/},/g, '},\n\n');
  };

  const handleGenerate = async () => {
    setLoading(true);
    setResponseData(''); // Clear previous response data

    try {
      const response = await fetch(
        'https://us-central1-lexriapp.cloudfunctions.net/foodGuideOptionsData',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Authorization: 'Bearer, // Replace with your bearer token
          },
          body: JSON.stringify({
            category: 'I want to gain bulk what foods are good.',
            user_request: 'do not include any non-veg food',
          }),
        }
      );

      // Check if the response is okay
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
      }

      // Check if response.body is available
      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let done = false;

        while (!done) {
          const { value, done: streamDone } = await reader.read();
          done = streamDone;

          if (value) {
            let chunk = decoder.decode(value, { stream: true });
            // Insert a newline after every occurrence of `{ [`
            chunk = chunk.replace(/{ \[/g, '{ [\n'); // Add a newline after `{ [`

            // Update state immediately with the current result
            setResponseData((prev) => prev + chunk); // Concatenate the new chunk to the existing data
            console.log('Received chunk:', chunk); // Debugging output
          }
        }
      } else {
        console.error('Response body is null.');
        setResponseData('No data received');
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setResponseData('Error fetching data: ' + error.message); // Display error message
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="response-box">
        {/* Split the response data by newline characters and map over them to render line by line */}
        {responseData.split('\n').map((line, index) => (
          <pre key={index}>{line}</pre>
        ))}
      </div>
      <button className="generate-button" onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate'}
      </button>
    </div>
  );
}

export default App;
