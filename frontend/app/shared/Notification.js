export default function Notification({ message, type }) {
    const styles = {
      success: { backgroundColor: 'green', color: 'white' },
      error: { backgroundColor: 'red', color: 'white' },
      info: { backgroundColor: 'blue', color: 'white' },
    };
  
    if (!message) return null;
  
    return (
      <div style={{ ...styles[type], padding: '10px', marginBottom: '20px', borderRadius: '5px', textAlign: 'center' }}>
        {message}
      </div>
    );
  }
  