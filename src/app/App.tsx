import React, {useEffect, useState} from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {ThemeProvider} from '../theme/ThemeContext';
import {ToastProvider} from '../components/Toast';
import {SplashOverlay} from '../components/SplashOverlay';
import {RootNavigator} from './navigation/RootNavigator';
import {hydrate, useHydrated} from '../data/store';
import {colors} from '../theme/tokens';

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ToastProvider>
            <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
            <AppBoot />
          </ToastProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const AppBoot: React.FC = () => {
  const ready = useHydrated();
  const [splashGone, setSplashGone] = useState(false);
  const [splashVisible, setSplashVisible] = useState(true);

  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    if (ready) {
      // small grace delay so the splash always shows for a beat (avoids flicker on warm starts)
      const t = setTimeout(() => setSplashVisible(false), 350);
      return () => clearTimeout(t);
    }
  }, [ready]);

  return (
    <View style={styles.flex}>
      {ready ? <RootNavigator /> : <View style={styles.flex} />}
      {!splashGone ? (
        <SplashOverlay
          visible={splashVisible}
          onFinished={() => setSplashGone(true)}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1, backgroundColor: colors.bg},
});

export default App;
