'use client';

import * as Sentry from "@sentry/nextjs";
import { useState } from "react";

export default function SentryTestPage() {
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (message: string) => {
        setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
    };

    const testInfoLog = () => {
        Sentry.logger.info('User triggered test log', { log_source: 'sentry_test' });
        addLog('✅ Info log sent to Sentry');
        console.log('Test info log sent to Sentry');
    };

    const testWarningLog = () => {
        console.warn('This is a test warning message', { log_source: 'sentry_test' });
        addLog('⚠️ Warning log sent to Sentry');
    };

    const testErrorLog = () => {
        console.error('This is a test error message', { log_source: 'sentry_test' });
        addLog('❌ Error log sent to Sentry');
    };

    const testException = () => {
        try {
            throw new Error('Test exception from Sentry test page');
        } catch (error) {
            Sentry.captureException(error);
            addLog('💥 Exception captured and sent to Sentry');
        }
    };

    const testMessage = () => {
        Sentry.captureMessage('Test message from Sentry', 'info');
        addLog('📨 Message sent to Sentry');
    };

    const testMetricCount = () => {
        Sentry.metrics.count('user_action', 1);
        addLog('📊 Metric count sent to Sentry (user_action: 1)');
    };

    const testMetricDistribution = () => {
        const responseTime = Math.floor(Math.random() * 500) + 50; // Random between 50-550ms
        Sentry.metrics.distribution('api_response_time', responseTime);
        addLog(`📈 Metric distribution sent to Sentry (api_response_time: ${responseTime}ms)`);
    };

    return (
        <div style={{
            padding: '2rem',
            maxWidth: '800px',
            margin: '0 auto',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔍 Sentry Test Page</h1>

            <div style={{
                padding: '1rem',
                background: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '8px',
                marginBottom: '2rem'
            }}>
                <strong>⚠️ Note:</strong> Sentry is only enabled in <strong>production mode</strong>.
                <br />
                Current mode: <strong>{process.env.NODE_ENV}</strong>
                {process.env.NODE_ENV !== 'production' && (
                    <>
                        <br />
                        <span style={{ color: '#856404' }}>
                            To test Sentry, run: <code>npm run build && npm start</code>
                        </span>
                    </>
                )}
            </div>

            <div style={{
                display: 'grid',
                gap: '1rem',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                marginBottom: '2rem'
            }}>
                <button
                    onClick={testInfoLog}
                    style={{
                        padding: '1rem',
                        background: '#0d6efd',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: '600'
                    }}
                >
                    📘 Test Info Log
                </button>

                <button
                    onClick={testWarningLog}
                    style={{
                        padding: '1rem',
                        background: '#ffc107',
                        color: '#000',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: '600'
                    }}
                >
                    ⚠️ Test Warning
                </button>

                <button
                    onClick={testErrorLog}
                    style={{
                        padding: '1rem',
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: '600'
                    }}
                >
                    ❌ Test Error
                </button>

                <button
                    onClick={testException}
                    style={{
                        padding: '1rem',
                        background: '#6f42c1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: '600'
                    }}
                >
                    💥 Test Exception
                </button>

                <button
                    onClick={testMessage}
                    style={{
                        padding: '1rem',
                        background: '#20c997',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: '600'
                    }}
                >
                    📨 Test Message
                </button>

                <button
                    onClick={testMetricCount}
                    style={{
                        padding: '1rem',
                        background: '#fd7e14',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: '600'
                    }}
                >
                    📊 Test Metric Count
                </button>

                <button
                    onClick={testMetricDistribution}
                    style={{
                        padding: '1rem',
                        background: '#17a2b8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: '600'
                    }}
                >
                    📈 Test Metric Distribution
                </button>
            </div>

            <div style={{
                background: '#f8f9fa',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #dee2e6'
            }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>📋 Activity Log</h2>
                {logs.length === 0 ? (
                    <p style={{ color: '#6c757d' }}>No logs yet. Click a button above to test Sentry.</p>
                ) : (
                    <div style={{
                        fontFamily: 'monospace',
                        fontSize: '0.9rem',
                        maxHeight: '300px',
                        overflowY: 'auto'
                    }}>
                        {logs.map((log, index) => (
                            <div key={index} style={{ padding: '0.5rem 0', borderBottom: '1px solid #e9ecef' }}>
                                {log}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={{
                marginTop: '2rem',
                padding: '1rem',
                background: '#e7f3ff',
                borderRadius: '8px',
                border: '1px solid #0d6efd'
            }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>📖 How to verify:</h3>
                <ol style={{ marginLeft: '1.5rem' }}>
                    <li>Build and run in production mode: <code>npm run build && npm start</code></li>
                    <li>Visit this page at <code>/sentry-test</code></li>
                    <li>Click the test buttons above</li>
                    <li>Check your Sentry dashboard at:
                        <br />
                        <a
                            href="https://o4510339695837185.ingest.de.sentry.io/"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#0d6efd' }}
                        >
                            Sentry Dashboard
                        </a>
                    </li>
                </ol>
            </div>
        </div>
    );
}
