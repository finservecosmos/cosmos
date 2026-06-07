import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, fontFamily: 'system-ui', textAlign: 'center' }}>
          <h2 style={{ color: '#c0392b' }}>Something went wrong</h2>
          <p style={{ color: '#888', marginTop: 8 }}>{this.state.error?.message}</p>
          <button onClick={() => window.location.href = '/'} style={{ marginTop: 20, padding: '10px 20px', background: '#c0392b', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
            Go to Login
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
