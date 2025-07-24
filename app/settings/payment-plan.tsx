"use client"

import { useTheme } from "@/contexts/ThemeContext"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import DarkGradientBackground from '../../components/DarkGradientBackground'

const PaymentPlanScreen = () => {
  const { colors } = useTheme()
  const router = useRouter()

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      features: ["Up to 100 notes", "Basic text formatting", "1GB storage", "Mobile app access"],
      current: true,
    },
    {
      name: "Pro",
      price: "$9.99",
      period: "per month",
      features: [
        "Unlimited notes",
        "Advanced formatting",
        "100GB storage",
        "Voice recording",
        "Cloud sync",
        "Priority support",
      ],
      popular: true,
    },
    {
      name: "Premium",
      price: "$19.99",
      period: "per month",
      features: [
        "Everything in Pro",
        "AI-powered search",
        "Unlimited storage",
        "Team collaboration",
        "Advanced analytics",
        "Custom integrations",
      ],
    },
  ]

  return (
    <DarkGradientBackground>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}> 
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Payment Plans</Text>
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle(colors)}>
          Choose the plan that works best for you
        </Text>
        {plans.map((plan, index) => {
          const isCurrent = plan.current;
          const isPopular = plan.popular;
          return (
            <View
              key={index}
              style={[
                styles.planCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: isCurrent
                    ? colors.success
                    : isPopular
                    ? colors.primary
                    : "transparent",
                },
              ]}
            >
              {/* Plan Header */}
              <View style={styles.planHeader}>
                {isPopular && (
                  <View style={[styles.badge, { backgroundColor: colors.primary }]}> 
                    <Text style={[styles.badgeText, { color: colors.background }]}>MOST POPULAR</Text>
                  </View>
                )}
                {isCurrent && (
                  <View style={[styles.badge, { backgroundColor: colors.success }]}> 
                    <Text style={[styles.badgeText, { color: colors.background }]}>CURRENT PLAN</Text>
                  </View>
                )}
                <Text style={[styles.planName, { color: colors.text }]}>{plan.name}</Text>
                <View style={styles.priceRow}>
                  <Text style={[styles.planPrice, { color: colors.primary }]}>{plan.price}</Text>
                  <Text style={[styles.planPeriod, { color: colors.textSecondary }]}>{plan.period}</Text>
                </View>
              </View>
              {/* Features */}
              <View style={styles.featuresList}>
                {plan.features.map((feature, i) => (
                  <Text key={i} style={[styles.feature, { color: colors.text }]}>• {feature}</Text>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </DarkGradientBackground>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  subtitle: (colors: any) => ({
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 18,
  }),
  planCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  planHeader: { alignItems: "center", marginBottom: 12 },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  planName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  priceRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: 8 },
  planPrice: {
    fontSize: 28,
    fontWeight: "bold",
  },
  planPeriod: {
    fontSize: 16,
    marginLeft: 6,
  },
  featuresList: { marginTop: 8 },
  feature: {
    fontSize: 15,
    marginBottom: 4,
  },
})

export default PaymentPlanScreen
