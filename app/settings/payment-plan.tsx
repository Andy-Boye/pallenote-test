"use client"

import { useTheme } from "@/contexts/ThemeContext"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import React, { useState } from "react"
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal } from "react-native"
import DarkGradientBackground from '../../components/DarkGradientBackground'

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  current: boolean;
  popular?: boolean;
  savings?: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

const PaymentPlanScreen = () => {
  const { colors } = useTheme()
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const plans: Plan[] = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      period: "forever",
      features: [
        "Up to 100 notes",
        "Basic text formatting", 
        "1GB storage",
        "Mobile app access",
        "Basic support"
      ],
      current: true,
    },
    {
      id: "pro",
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
        "Export options"
      ],
      current: false,
      popular: true,
      savings: "Save 20% with annual billing"
    },
    {
      id: "premium",
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
        "Dedicated support"
      ],
      current: false,
      savings: "Save 25% with annual billing"
    },
  ]

  const paymentMethods: PaymentMethod[] = [
    {
      id: "momo",
      name: "MoMo",
      icon: "phone-portrait",
      color: "#FF6B35",
      description: "Mobile Money - Instant payment"
    },
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: "card",
      color: "#3B82F6",
      description: "Visa, Mastercard, American Express"
    },
    {
      id: "paypal",
      name: "PayPal",
      icon: "logo-paypal",
      color: "#0070BA",
      description: "Pay with your PayPal account"
    },
    {
      id: "bank",
      name: "Bank Transfer",
      icon: "business",
      color: "#10B981",
      description: "Direct bank transfer"
    }
  ]

  const handlePlanSelect = (planId: string) => {
    if (planId === "free") {
      Alert.alert("Free Plan", "You're already on the free plan!")
      return
    }
    setSelectedPlan(planId)
    setShowPaymentModal(true)
  }

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId)
  }

  const handlePayment = () => {
    if (!selectedPaymentMethod) {
      Alert.alert("Payment Method", "Please select a payment method")
      return
    }

    setIsProcessing(true)
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      setShowPaymentModal(false)
      
      const plan = plans.find(p => p.id === selectedPlan)
      const method = paymentMethods.find(m => m.id === selectedPaymentMethod)
      
      Alert.alert(
        "Payment Successful!",
        `Your ${plan?.name} plan has been activated using ${method?.name}.`,
        [
          {
            text: "Great!",
            onPress: () => {
              setSelectedPlan(null)
              setSelectedPaymentMethod(null)
            }
          }
        ]
      )
    }, 2000)
  }

  const getPlanById = (id: string) => plans.find(p => p.id === id)

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
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Choose the plan that works best for you
        </Text>

        {plans.map((plan, index) => {
          const isCurrent = plan.current;
          const isPopular = plan.popular;
          const isSelected = selectedPlan === plan.id;
          
          return (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: isCurrent
                    ? colors.success
                    : isSelected
                    ? colors.primary
                    : isPopular
                    ? colors.primary
                    : colors.border,
                  borderWidth: isSelected ? 3 : 2,
                },
              ]}
              onPress={() => handlePlanSelect(plan.id)}
              activeOpacity={0.8}
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
                {isSelected && (
                  <View style={[styles.badge, { backgroundColor: colors.primary }]}> 
                    <Text style={[styles.badgeText, { color: colors.background }]}>SELECTED</Text>
                  </View>
                )}
                
                <Text style={[styles.planName, { color: colors.text }]}>{plan.name}</Text>
                <View style={styles.priceRow}>
                  <Text style={[styles.planPrice, { color: colors.primary }]}>{plan.price}</Text>
                  <Text style={[styles.planPeriod, { color: colors.textSecondary }]}>{plan.period}</Text>
                </View>
                
                {plan.savings && (
                  <Text style={[styles.savingsText, { color: colors.success }]}>{plan.savings}</Text>
                )}
              </View>

              {/* Features */}
              <View style={styles.featuresList}>
                {plan.features.map((feature, i) => (
                  <View key={i} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                    <Text style={[styles.feature, { color: colors.text }]}>{feature}</Text>
                  </View>
                ))}
              </View>

              {/* Action Button */}
              {!isCurrent && (
                <TouchableOpacity
                  style={[
                    styles.selectButton,
                    { 
                      backgroundColor: isSelected ? colors.primary : colors.card,
                      borderColor: colors.primary
                    }
                  ]}
                  onPress={() => handlePlanSelect(plan.id)}
                >
                  <Text style={[
                    styles.selectButtonText,
                    { color: isSelected ? colors.background : colors.primary }
                  ]}>
                    {isSelected ? "Selected" : "Select Plan"}
                  </Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Payment Method Modal */}
      <Modal
        visible={showPaymentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Choose Payment Method
              </Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              Select your preferred payment method for {getPlanById(selectedPlan!)?.name} plan
            </Text>

            <ScrollView style={styles.paymentMethodsList}>
              {paymentMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.paymentMethodCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: selectedPaymentMethod === method.id ? method.color : colors.border,
                      borderWidth: selectedPaymentMethod === method.id ? 2 : 1,
                    }
                  ]}
                  onPress={() => handlePaymentMethodSelect(method.id)}
                >
                  <View style={styles.paymentMethodInfo}>
                    <View style={[styles.paymentIcon, { backgroundColor: method.color }]}>
                      <Ionicons name={method.icon as any} size={20} color="white" />
                    </View>
                    <View style={styles.paymentDetails}>
                      <Text style={[styles.paymentName, { color: colors.text }]}>{method.name}</Text>
                      <Text style={[styles.paymentDescription, { color: colors.textSecondary }]}>
                        {method.description}
                      </Text>
                    </View>
                  </View>
                  {selectedPaymentMethod === method.id && (
                    <Ionicons name="checkmark-circle" size={24} color={method.color} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.payButton,
                {
                  backgroundColor: selectedPaymentMethod ? colors.primary : colors.border,
                  opacity: selectedPaymentMethod ? 1 : 0.5
                }
              ]}
              onPress={handlePayment}
              disabled={!selectedPaymentMethod || isProcessing}
            >
              {isProcessing ? (
                <Text style={[styles.payButtonText, { color: colors.background }]}>
                  Processing...
                </Text>
              ) : (
                <Text style={[styles.payButtonText, { color: colors.background }]}>
                  Pay {getPlanById(selectedPlan!)?.price}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 18,
  },
  planCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  planHeader: { 
    alignItems: "center", 
    marginBottom: 16 
  },
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
  priceRow: { 
    flexDirection: "row", 
    alignItems: "flex-end", 
    marginBottom: 4 
  },
  planPrice: {
    fontSize: 28,
    fontWeight: "bold",
  },
  planPeriod: {
    fontSize: 16,
    marginLeft: 6,
  },
  savingsText: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 4,
  },
  featuresList: { 
    marginTop: 8,
    marginBottom: 16
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  feature: {
    fontSize: 15,
    marginLeft: 8,
    flex: 1,
  },
  selectButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  paymentMethodsList: {
    marginBottom: 20,
  },
  paymentMethodCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  paymentMethodInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  paymentDetails: {
    flex: 1,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  paymentDescription: {
    fontSize: 14,
  },
  payButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
})

export default PaymentPlanScreen
