import AuthContextProvider from '@/Contexts/AuthContext/authContextProvider';
import '../styles/style.css';

console.log = () => {}
console.error = () => {}
console.debug = () => {}

export default function MyApp({ Component, pageProps }) {
    return(
      <AuthContextProvider>
        <Component {...pageProps} />
      </AuthContextProvider>
    );
  }