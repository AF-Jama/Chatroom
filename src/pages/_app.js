import AuthContextProvider from '@/Contexts/AuthContext/authContextProvider';
import '../styles/style.css';

export default function MyApp({ Component, pageProps }) {
    return(
      <AuthContextProvider>
        <Component {...pageProps} />
      </AuthContextProvider>
    );
  }