import '../styles/global.css';
import AuthContextProvider from '@/Contexts/AuthContext/authContextProvider';

export default function MyApp({ Component, pageProps }) {
    return(
      <AuthContextProvider>
        <Component {...pageProps} />
      </AuthContextProvider>
    );
  }