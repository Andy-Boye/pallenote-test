"use client"

import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Button, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
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
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [modalVisible, setModalVisible] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState<string>("");
  const [newEventTime, setNewEventTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editEventTitle, setEditEventTitle] = useState("");
  const [editEventDate, setEditEventDate] = useState<string>("");
  const [editEventTime, setEditEventTime] = useState<Date | null>(null);
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);
  const [showEditTimePicker, setShowEditTimePicker] = useState(false);

  // Delete event handler
  const handleDeleteEvent = () => {
    if (!selectedEvent) return;
    console.log('Events before delete:', events);
    const updatedEvents = events.filter(
      e => e.id && e.title && e.date && e.id !== selectedEvent.id
    );
    console.log('Events after delete:', updatedEvents);
    setEvents(updatedEvents);
    setDetailsModalVisible(false);
    setSelectedEvent(null);
  };

  // Edit event handler
  const handleEditEvent = () => {
    if (!selectedEvent) return;
    setEditEventTitle(selectedEvent.title);
    setEditEventDate(selectedEvent.date.slice(0, 10));
    setEditEventTime(new Date(selectedEvent.date));
    setEditModalVisible(true);
    setDetailsModalVisible(false);
  };

  // Save edited event
  const handleSaveEditEvent = () => {
    if (!editEventTitle || !editEventDate || !editEventTime || !selectedEvent) {
      Alert.alert("Missing Fields", "Please fill in all fields.");
      return;
    }
    const dateTime = new Date(editEventDate + 'T' + editEventTime.toTimeString().slice(0, 8));
    setEvents(events.map(e => e.id === selectedEvent.id ? { ...e, title: editEventTitle, date: dateTime.toISOString() } : e));
    setEditModalVisible(false);
    setSelectedEvent(null);
  };

  // Placeholder for add event (future feature)
  const addEvent = () => {
    setNewEventTitle("");
    setNewEventDate(selectedDate || new Date().toISOString().slice(0, 10));
    setNewEventTime(new Date());
    setModalVisible(true);
  };

  const handleSaveEvent = () => {
    if (!newEventTitle || !newEventDate || !newEventTime) {
      Alert.alert("Missing Fields", "Please fill in all fields.");
      return;
    }
    // Combine date and time
    const dateTime = new Date(newEventDate + 'T' + newEventTime.toTimeString().slice(0, 8));
    const newEvent: CalendarEvent = {
      id: Math.random().toString(36).substr(2, 9),
      title: newEventTitle,
      date: dateTime.toISOString(),
    };
    setEvents([newEvent, ...events]);
    setModalVisible(false);
  };

  // Handler for pressing an event card
  const handleEventPress = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setDetailsModalVisible(true);
  };

  // Quick stats
  const totalEvents = events.length;
  const upcomingEvents = events.filter(e => new Date(e.date) > new Date());
  const nextEvent = upcomingEvents
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  useEffect(() => {
    if (events.length === 0) {
      const now = new Date();
      const defaultEvents: CalendarEvent[] = [
        {
          id: '1',
          title: 'Team Sync Meeting',
          date: new Date(now.getTime() + 1 * 60 * 60 * 1000).toISOString(), // 1 hour from now
        },
        {
          id: '2',
          title: 'Project Kickoff',
          date: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        },
        {
          id: '3',
          title: 'Client Demo',
          date: new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours from now
        },
      ];
      setEvents(defaultEvents);
    }
    setLoading(false);
    // eslint-disable-next-line
  }, []);

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
      {/* Event Creation Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <View style={{ backgroundColor: colors.surface, padding: 24, borderRadius: 18, width: '90%' }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 12 }}>Add Event</Text>
            <TextInput
              placeholder="Event Title"
              value={newEventTitle}
              onChangeText={setNewEventTitle}
              style={{ borderWidth: 1, borderColor: colors.primary, borderRadius: 8, padding: 10, marginBottom: 14, color: colors.text }}
              placeholderTextColor={colors.textSecondary}
            />
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{ marginBottom: 14 }}>
              <Text style={{ color: colors.text, fontSize: 16 }}>
                Date: {newEventDate || (selectedDate || new Date().toISOString().slice(0, 10))}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowTimePicker(true)} style={{ marginBottom: 14 }}>
              <Text style={{ color: colors.text, fontSize: 16 }}>
                Time: {newEventTime ? newEventTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 18 }}>
              <Pressable onPress={() => setModalVisible(false)} style={{ marginRight: 18 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 16 }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleSaveEvent}>
                <Text style={{ color: colors.primary, fontSize: 16, fontWeight: 'bold' }}>Add</Text>
              </Pressable>
            </View>
            {/* Date Picker */}
            {showDatePicker && (
              <>
                {Platform.OS === 'android' ? (
                  <Button title="Pick Date" onPress={() => setShowDatePicker(false)} />
                ) : null}
                <DateTimePicker
                  value={newEventDate ? new Date(newEventDate) : new Date()}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  onChange={(event, date) => {
                    setShowDatePicker(false);
                    if (date) setNewEventDate(date.toISOString().slice(0, 10));
                  }}
                />
              </>
            )}
            {/* Time Picker */}
            {showTimePicker && (
              <>
                {Platform.OS === 'android' ? (
                  <Button title="Pick Time" onPress={() => setShowTimePicker(false)} />
                ) : null}
                <DateTimePicker
                  value={newEventTime || new Date()}
                  mode="time"
                  display="clock"
                  minimumDate={
                    newEventDate === new Date().toISOString().slice(0, 10)
                      ? new Date()
                      : undefined
                  }
                  onChange={(event, date) => {
                    setShowTimePicker(false);
                    if (date) setNewEventTime(date);
                  }}
                />
              </>
            )}
          </View>
        </View>
      </Modal>
      {/* Event Details Modal */}
      <Modal
        visible={detailsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.2)' }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 28, minHeight: 440 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 22, color: colors.text }}>Calendar event</Text>
              <Pressable onPress={() => setDetailsModalVisible(false)}>
                <Ionicons name="close" size={26} color={colors.textSecondary} />
              </Pressable>
            </View>
            {selectedEvent && (
              <>
                <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 21, marginBottom: 4 }}>{selectedEvent.title}</Text>
                <Text style={{ color: colors.textSecondary, marginBottom: 18, fontSize: 17 }}>
                  {formatDate(selectedEvent.date)}
                </Text>
                {/* <Pressable style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 22 }} onPress={() => {
                  if (selectedEvent) {
                    setDetailsModalVisible(false);
                    router.push({ pathname: '../events/[eventId]/index', params: { eventId: selectedEvent.id } });
                  }
                }}>
                  <Ionicons name="arrow-forward" size={22} color={colors.primary} style={{ marginRight: 10 }} />
                  <Text style={{ color: colors.primary, fontWeight: '500', fontSize: 17 }}>Open &quot;{selectedEvent.title}&quot;</Text>
                </Pressable> */}
                <Pressable style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                  <Ionicons name="document-outline" size={22} color={colors.primary} style={{ marginRight: 10 }} />
                  <Text style={{ color: colors.primary, fontSize: 17 }}>Create a note</Text>
                </Pressable>
                <Pressable style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                  <Ionicons name="link-outline" size={22} color={colors.text} style={{ marginRight: 10 }} />
                  <Text style={{ color: colors.text, fontSize: 17 }}>Link a note</Text>
                </Pressable>
                <Pressable style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                  <Ionicons name="search-outline" size={22} color={colors.text} style={{ marginRight: 10 }} />
                  <Text style={{ color: colors.text, fontSize: 17 }}>View related notes</Text>
                </Pressable>
                <Pressable style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }} onPress={handleEditEvent}>
                  <Ionicons name="pencil-outline" size={22} color={colors.text} style={{ marginRight: 10 }} />
                  <Text style={{ color: colors.text, fontSize: 17 }}>Edit event</Text>
                </Pressable>
                <Pressable style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }} onPress={handleDeleteEvent}>
                  <Ionicons name="trash-outline" size={22} color={colors.error} style={{ marginRight: 10 }} />
                  <Text style={{ color: colors.error, fontSize: 17 }}>Delete event</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
      {/* Edit Event Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <View style={{ backgroundColor: colors.surface, padding: 24, borderRadius: 18, width: '90%' }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 12 }}>Edit Event</Text>
            <TextInput
              placeholder="Event Title"
              value={editEventTitle}
              onChangeText={setEditEventTitle}
              style={{ borderWidth: 1, borderColor: colors.primary, borderRadius: 8, padding: 10, marginBottom: 14, color: colors.text }}
              placeholderTextColor={colors.textSecondary}
            />
            <TouchableOpacity onPress={() => setShowEditDatePicker(true)} style={{ marginBottom: 14 }}>
              <Text style={{ color: colors.text, fontSize: 16 }}>
                Date: {editEventDate || new Date().toISOString().slice(0, 10)}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowEditTimePicker(true)} style={{ marginBottom: 14 }}>
              <Text style={{ color: colors.text, fontSize: 16 }}>
                Time: {editEventTime ? editEventTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 18 }}>
              <Pressable onPress={() => setEditModalVisible(false)} style={{ marginRight: 18 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 16 }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleSaveEditEvent}>
                <Text style={{ color: colors.primary, fontSize: 16, fontWeight: 'bold' }}>Save</Text>
              </Pressable>
            </View>
            {/* Date Picker */}
            {showEditDatePicker && (
              <>
                {Platform.OS === 'android' ? (
                  <Button title="Pick Date" onPress={() => setShowEditDatePicker(false)} />
                ) : null}
                <DateTimePicker
                  value={editEventDate ? new Date(editEventDate) : new Date()}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  onChange={(event, date) => {
                    setShowEditDatePicker(false);
                    if (date) setEditEventDate(date.toISOString().slice(0, 10));
                  }}
                />
              </>
            )}
            {/* Time Picker */}
            {showEditTimePicker && (
              <>
                {Platform.OS === 'android' ? (
                  <Button title="Pick Time" onPress={() => setShowEditTimePicker(false)} />
                ) : null}
                <DateTimePicker
                  value={editEventTime || new Date()}
                  mode="time"
                  display="clock"
                  minimumDate={
                    editEventDate === new Date().toISOString().slice(0, 10)
                      ? new Date()
                      : undefined
                  }
                  onChange={(event, date) => {
                    setShowEditTimePicker(false);
                    if (date) setEditEventTime(date);
                  }}
                />
              </>
            )}
          </View>
        </View>
      </Modal>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}> 
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
        <View style={[styles.statsRow, { paddingHorizontal: 10 }]}> 
          <View style={[styles.statCard, { backgroundColor: colors.surface, flex: 1, marginRight: 8 }]}> 
            <Ionicons name="calendar" size={20} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={{ color: colors.text, fontWeight: '600', fontSize: 15 }}>Total Events</Text>
            <Text style={{ color: colors.textSecondary, marginLeft: 6 }}>{totalEvents}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, flex: 1, marginLeft: 8 }]}> 
            <Ionicons name="alarm" size={20} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={{ color: colors.text, fontWeight: '600', fontSize: 15, flexShrink: 1, flexWrap: 'nowrap', maxWidth: 120 }} numberOfLines={1} ellipsizeMode="tail">Next</Text>
            <Text style={{ color: colors.textSecondary, marginLeft: 6, flex: 1 }} numberOfLines={1} ellipsizeMode="tail">
              {nextEvent ? (nextEvent.title.length > 18 ? nextEvent.title.slice(0, 18) + '...' : nextEvent.title) : 'None'}
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
                {upcomingEvents.length} event{upcomingEvents.length === 1 ? '' : 's'}
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
          <Pressable key={event.id} style={eventCardStyle(colors)} onPress={() => handleEventPress(event)}>
            <Text style={{ color: colors.text, fontWeight: '600', fontSize: 16 }}>{event.title}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{formatDate(event.date)}</Text>
          </Pressable>
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
            <Pressable key={event.id + '-upcoming'} style={eventCardStyle(colors)} onPress={() => handleEventPress(event)}>
              <Text style={{ color: colors.text, fontWeight: '600', fontSize: 16 }}>{event.title}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{formatDate(event.date)}</Text>
            </Pressable>
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
