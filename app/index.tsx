import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

export default function Index() {
  return (
    <SafeAreaView style={styles.container}>
      <WebView
        style={styles.webview}
        source={{ uri: 'https://vedic-web-lemon.vercel.app/' }} 
        onFileDownload={({ nativeEvent }) => {
          const { downloadUrl } = nativeEvent;
          Linking.openURL(downloadUrl).catch(() => {
            Alert.alert('Erro', 'Não foi possível iniciar o download.');
          });
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});
