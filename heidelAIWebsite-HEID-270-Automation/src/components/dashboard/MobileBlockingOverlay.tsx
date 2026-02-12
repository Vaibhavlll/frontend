export default function MobileBlockingOverlay() {
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            textAlign: 'center'
        }}>
            <p style={{
                color: 'black',
                fontSize: '18px',
                fontWeight: '500',
                margin: 0
            }}>
                Dashboard is not available on mobile yet
            </p>
        </div>
    );
}
