"use client"

import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Calendar } from 'react-native-calendars';
import DarkGradientBackground from '../../components/DarkGradientBackground';

interface CalendarEvent {
  id: string
  title: string
  date: string
}

// Replace with actual API call later
const getCalendarEvents = async (): Promise<CalendarEvent[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: "1", title: "Team Meeting", date: "2024-01-15T10:00:00Z" },
        { id: "2", title: "Project Review", date: "2024-01-16T14:00:00Z" },
        { id: "3", title: "Client Call", date: "2024-01-17T09:00:00Z" },
      ])
    }, 1000)
  })
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function CalendarScreen() {
  const { colors } = useTheme()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string>('')

  // Placeholder for add event (future feature)
  const addEvent = () => {
    Alert.alert('Add Event', 'Feature coming soon!');
  };

  // Quick stats
  const totalEvents = events.length;
  const nextEvent = events
    .filter(e => new Date(e.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCalendarEvents()
        setEvents(data)
      } catch (error) {
        console.error("Error fetching events:", error)
        Alert.alert("Error", "Could not load calendar events.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Filter events for the selected date
  const eventsForSelectedDate = selectedDate
    ? events.filter(e => e.date.slice(0, 10) === selectedDate)
    : []

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <DarkGradientBackground>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}> 
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Calendar</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Your schedule at a glance</Text>
        </View>
        <TouchableOpacity onPress={addEvent} style={[styles.addButton, { backgroundColor: colors.primary }]}> 
          <Ionicons name="calendar-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120, alignItems: 'center', width: '100%' }}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}> 
            <Ionicons name="calendar" size={20} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={{ color: colors.text, fontWeight: '600', fontSize: 15 }}>Total Events</Text>
            <Text style={{ color: colors.textSecondary, marginLeft: 6 }}>{totalEvents}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}> 
            <Ionicons name="alarm" size={20} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={{ color: colors.text, fontWeight: '600', fontSize: 15 }}>Next</Text>
            <Text style={{ color: colors.textSecondary, marginLeft: 6 }}>
              {nextEvent ? nextEvent.title : 'None'}
            </Text>
          </View>
        </View>
        {/* Calendar Card */}
        <View style={[styles.calendarCard, { maxWidth: 600, height: 440 }]}> 
          <Calendar
            onDayPress={day => setSelectedDate(day.dateString)}
            markedDates={selectedDate ? { [selectedDate]: { selected: true, selectedColor: colors.primary } } : {}}
            theme={{
              backgroundColor: 'transparent',
              calendarBackground: 'transparent',
              textSectionTitleColor: colors.textSecondary,
              selectedDayBackgroundColor: colors.primary,
              selectedDayTextColor: '#fff',
              todayTextColor: colors.primary,
              dayTextColor: colors.text,
              textDisabledColor: colors.textSecondary,
              arrowColor: colors.primary,
              monthTextColor: colors.text,
              indicatorColor: colors.primary,
            }}
            style={{ borderRadius: 18, marginBottom: 10, elevation: 2, width: '100%', height: 400, alignSelf: 'center', backgroundColor: colors.card }}
          />
        </View>
        {/* Upcoming Events & Reminders Section */}
        <View style={styles.optionsRow}>
          <View style={[styles.optionCard, { backgroundColor: colors.surface }]}> 
            <Ionicons name="list-circle-outline" size={22} color={colors.primary} style={{ marginRight: 8 }} />
            <View>
              <Text style={{ color: colors.text, fontWeight: '600', fontSize: 15 }}>Upcoming Events</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                3 events
              </Text>
            </View>
          </View>
          <View style={[styles.optionCard, { backgroundColor: colors.surface }]}> 
            <Ionicons name="notifications-outline" size={22} color={colors.primary} style={{ marginRight: 8 }} />
            <View>
              <Text style={{ color: colors.text, fontWeight: '600', fontSize: 15 }}>Reminders</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>No reminders</Text>
            </View>
          </View>
        </View>
        {/* Show 3 event cards for selected date, or prompt to select a date */}
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginTop: 10, marginBottom: 8, textAlign: 'center' }}>
          {selectedDate ? `Events for ${selectedDate}` : 'Select a date to view events'}
        </Text>
        {selectedDate && eventsForSelectedDate.length === 0 && (
          <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 12 }}>
            No events scheduled for this date.
          </Text>
        )}
        {selectedDate && eventsForSelectedDate.slice(0, 3).map(event => (
          <View key={event.id} style={eventCardStyle(colors)}>
            <Text style={{ color: colors.text, fontWeight: '600', fontSize: 16 }}>{event.title}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{formatDate(event.date)}</Text>
          </View>
        ))}
        {/* Always show 3 upcoming events below */}
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginTop: 18, marginBottom: 8, textAlign: 'center' }}>
          Upcoming Events
        </Text>
        {events
          .filter(e => new Date(e.date) > new Date())
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 3)
          .map(event => (
            <View key={event.id + '-upcoming'} style={eventCardStyle(colors)}>
              <Text style={{ color: colors.text, fontWeight: '600', fontSize: 16 }}>{event.title}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{formatDate(event.date)}</Text>
            </View>
        ))}
      </ScrollView>
      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={addEvent}
        style={styles.fab}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </DarkGradientBackground>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "transparent",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
    marginBottom: 2,
  },
  addButton: {
    borderRadius: 24,
    padding: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
    marginTop: 2,
    gap: 12,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
    minWidth: 120,
    backgroundColor: 'white',
  },
  calendarCard: {
    backgroundColor: 'transparent',
    borderRadius: 18,
    padding: 8,
    marginBottom: 8,
    alignItems: 'center',
    width: '100%',
    maxWidth: 600,
    height: 440,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
    marginTop: 2,
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
    minWidth: 140,
    backgroundColor: 'white',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 8,
    width: '100%',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: '#22335a',
    borderRadius: 32,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 6,
  },
});

// Helper for event card style
function eventCardStyle(colors: any) {
  return {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    width: '92%' as import('react-native').DimensionValue,
    alignSelf: 'center' as import('react-native').FlexAlignType,
  };
}
