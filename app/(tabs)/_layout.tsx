import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useAuth } from '@/contexts/AuthContext';

export default function TabLayout() {
  const { user } = useAuth();
  const router = useRouter();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#BFBFBF',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: '#1E1A21',
            paddingVertical: 8,
          },
          default: { backgroundColor: '#1E1A21', paddingVertical: 8 },
        }),
        tabBarLabelStyle: { textAlign: 'center', width: '100%', marginBottom: 4, fontSize: 12, fontWeight: '600' },
        tabBarItemStyle: { backgroundColor: 'transparent', marginVertical: 6 },
        tabBarActiveBackgroundColor: 'transparent',
        tabBarInactiveBackgroundColor: 'transparent',
      }}>
      <Tabs.Screen
        name="videos/index"
        options={{
          title: 'Meus Vídeos',
          tabBarIcon: ({ color }) => <IconSymbol size={16} name="list.bullet" color={color} />,
        }}
      />
      <Tabs.Screen
        name="upload/index"
        options={{
          title: 'Enviar Vídeo',
          tabBarIcon: ({ color }) => <IconSymbol size={16} name="square.and.arrow.up" color={color} />,
          tabBarButton: (props) => (
            <HapticTab
              {...props}
              onPress={(e: any) => {
                if (!user) {
                  e?.preventDefault?.();
                  router.push('/login');
                  return;
                }
                props.onPress?.(e);
              }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
