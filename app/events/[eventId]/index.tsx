import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


export default function EventDetailsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { title, date, eventId } = useLocalSearchParams();
  console.log('EventDetailsScreen params:', { eventId, title, date });

  function formatEventDate(dateString: string) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  if (!title || !date) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Text style={{ color: colors.text, fontSize: 18 }}>Event not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 18, marginBottom: 8, paddingHorizontal: 18 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Ionicons name="arrow-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.text, flex: 1 }} numberOfLines={1} ellipsizeMode="tail">
          {title} - {formatEventDate(date as string)}
        </Text>
        <TouchableOpacity style={{ marginLeft: 10 }}>
          <Ionicons name="share-outline" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={{ marginLeft: 10 }}>
          <Ionicons name="ellipsis-vertical" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Ionicons name="calendar-outline" size={20} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={{ fontWeight: 'bold', fontSize: 17, color: colors.text }}>{title}</Text>
        </View>
        <Text style={{ color: colors.textSecondary, fontSize: 15, marginBottom: 2 }}>Date & Time:</Text>
        <Text style={{ color: colors.text, fontSize: 15 }}>{formatEventDate(date as string)}</Text>
      </View>
      <Text style={{ fontWeight: 'bold', fontSize: 18, color: colors.text, marginTop: 24, marginLeft: 18 }}>Action Items</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 18, marginTop: 8 }}>
        <Ionicons name="ellipse-outline" size={22} color={colors.textSecondary} style={{ marginRight: 8 }} />
        <Text style={{ color: colors.textSecondary, fontSize: 16 }}>Add new task</Text>
      </View>
      <Text style={{ fontWeight: 'bold', fontSize: 18, color: colors.text, marginTop: 32, marginLeft: 18 }}>Notes</Text>
      <View style={{ marginLeft: 18, marginTop: 8 }}>
        <Text style={{ color: colors.text, fontSize: 16 }}>•</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 18,
    marginHorizontal: 16,
    marginTop: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
}); 