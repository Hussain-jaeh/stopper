import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { MoneyInsights } from '../components/money/MoneyInsightsAndSettings';
import { SpendingSettings } from '../lib/money';
import { colors } from '../constants/colors';

export function MoneyInsightsScreen() {
  const navigation = useNavigation();
  const data = useQuery(api.dashboard.getDashboard);

  const profile = data?.profile;
  const hasSpending = !!(profile?.spendingAmount);

  useEffect(() => {
    if (data !== undefined && !hasSpending) {
      navigation.goBack();
    }
  }, [data, hasSpending, navigation]);

  if (!data || !profile || !hasSpending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.jade400} />
      </View>
    );
  }

  const settings: SpendingSettings = {
    spendingAmount: profile.spendingAmount!,
    spendingFrequency: profile.spendingFrequency ?? 'monthly',
    currency: profile.currency ?? 'USD',
    trackingEnabled: true,
  };

  return (
    <MoneyInsights
      settings={settings}
      daysSinceQuit={data.daysSinceQuit}
      onBack={() => navigation.goBack()}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
});
