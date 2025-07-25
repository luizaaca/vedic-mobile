import { Redirect } from 'expo-router';
import { Platform, StyleSheet, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
 
const VEDIC_WEB_URL = 'https://vedic-web-lemon.vercel.app/';

export default function Index() {
  if (Platform.OS === 'web') {
    return <Redirect href={VEDIC_WEB_URL} />;
  }

  // 1. Função para compartilhar a imagem usando o menu nativo
  const shareImage = async (fileData: string, fileName: string, mimeType: string) => {
    // O caminho onde o arquivo será salvo temporariamente no cache do app
    const path = `${RNFS.CachesDirectoryPath}/${fileName}`;
    
    // O arquivo vem como uma data URL (ex: "data:image/jpeg;base64,...")
    // Precisamos remover o prefixo para obter apenas a string base64 pura.
    const base64Data = fileData.replace(/^data:[a-z]+\/[a-z]+;base64,/, "");

    try {
      // 1. Escreve o arquivo no cache do app
      await RNFS.writeFile(path, base64Data, 'base64');

      // 2. Abre a planilha de compartilhamento nativa com o arquivo
      await Share.open({
        url: `file://${path}`, // O caminho para o nosso arquivo temporário
        type: mimeType,
        title: 'Compartilhar Mapa Astral', // Título opcional (principalmente no Android)
        failOnCancel: false, // Não trata o cancelamento do usuário como um erro
      });
    } catch (error) {
      // O erro "User did not share" é comum e significa que o usuário cancelou a ação.
      // Não precisamos mostrar um alerta de erro para isso.
      if (error.message.includes('User did not share')) {
        console.log('Ação de compartilhamento cancelada pelo usuário.');
        return;
      }
      console.error('Erro ao compartilhar arquivo:', error);
      Alert.alert('Erro', 'Não foi possível compartilhar o arquivo.');
    }
  };

  // 2. Função principal que recebe as mensagens da WebView
  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);

      // Verificamos se a mensagem é do tipo que esperamos
      if (message.type === 'DOWNLOAD_CHART_IMAGE' && message.payload) {
        const { fileData, fileName, mimeType } = message.payload;
        if (fileData && fileName && mimeType) {
          shareImage(fileData, fileName, mimeType);
        }
      }
    } catch (error) {
      // Ignora mensagens que não são JSON
      console.log('[WebView Mensagem] Dados não-JSON recebidos:', event.nativeEvent.data);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        style={styles.webview}
        source={{ uri: VEDIC_WEB_URL }}
        onMessage={handleMessage}
        // Abre links externos no navegador padrão do dispositivo
        onShouldStartLoadWithRequest={(event) => {
          if (!event.url.startsWith(VEDIC_WEB_URL)) {
            Linking.openURL(event.url);
            return false;
          }
          return true;
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
