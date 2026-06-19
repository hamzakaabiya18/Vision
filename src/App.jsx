import { AuthProvider, useAuth } from './contexts/AuthContext'
import AppLayout from './components/AppLayout'
import Login from './components/Login'

function AuthLoading() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#F0FAFA' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:48, height:48, border:'4px solid rgba(0,128,128,.15)', borderTopColor:'#008080', borderRadius:'50%', animation:'spin .7s linear infinite', margin:'0 auto 16px' }} />
        <p style={{ fontSize:13, color:'#008080', fontWeight:600 }}>Loading VISION...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function Root() {
  const { currentUser, loading } = useAuth()
  if (loading) return <AuthLoading />
  if (!currentUser) return <Login />
  return <AppLayout />
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  )
}
