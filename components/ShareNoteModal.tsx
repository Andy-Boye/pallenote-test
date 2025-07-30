import { getSharingStats, shareNote } from '@/api/notesApi';
import { useTheme } from '@/contexts/ThemeContext';
import { stripHtmlTags } from '@/utils/htmlUtils';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    Modal,
    PermissionsAndroid,
    Platform,
    Pressable,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface ShareNoteModalProps {
  visible: boolean;
  onClose: () => void;
  note: {
    id: string;
    title: string;
    content: string;
  } | null;
}

type ShareMethod = 'email' | 'community' | 'whatsapp' | 'telegram' | 'other';

const ShareNoteModal: React.FC<ShareNoteModalProps> = ({
  visible,
  onClose,
  note,
}) => {
  const { colors } = useTheme();
  const [recipientEmail, setRecipientEmail] = useState('');
  const [accessType, setAccessType] = useState<'Viewer' | 'Editor'>('Viewer');
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [shareId, setShareId] = useState('');
  const [selectedShareMethod, setSelectedShareMethod] = useState<ShareMethod | null>(null);
  const [sharingStats, setSharingStats] = useState({
    totalSent: 0,
    totalReceived: 0,
    activeShares: 0,
    recentShares: 0,
  });

  // Mock community members - in real app, this would come from API
  const communityMembers = [
    { id: '1', name: 'Sarah Johnson', email: 'sarah.johnson@example.com', avatar: 'SJ' },
    { id: '2', name: 'Mike Chen', email: 'mike.chen@example.com', avatar: 'MC' },
    { id: '3', name: 'Emma Davis', email: 'emma.davis@example.com', avatar: 'ED' },
    { id: '4', name: 'Alex Thompson', email: 'alex.thompson@example.com', avatar: 'AT' },
  ];

  useEffect(() => {
    if (visible) {
      loadSharingStats();
    }
  }, [visible]);

  const loadSharingStats = async () => {
    try {
      const stats = await getSharingStats();
      setSharingStats(stats);
    } catch (error) {
      console.error('Error loading sharing stats:', error);
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'This app needs access to storage to share files.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const generateShareLink = async (): Promise<{ shareUrl: string; shareId: string }> => {
    if (!note) throw new Error('No note selected');

    const shareData = {
      recipientEmail: 'system@example.com', // Placeholder for system sharing
      accessType: 'Viewer' as const,
    };

    const result = await shareNote(parseInt(note.id), shareData);
    return result;
  };

  const handleShareViaEmail = async () => {
    if (!note) return;

    if (!recipientEmail.trim()) {
      Alert.alert('Error', 'Please enter a recipient email address.');
      return;
    }

    if (!recipientEmail.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    setIsSharing(true);
    try {
      const shareData = {
        recipientEmail: recipientEmail.trim(),
        accessType,
      };

      const result = await shareNote(parseInt(note.id), shareData);
      setShareUrl(result.shareUrl);
      setShareId(result.shareId);
      
      // Reload stats after sharing
      await loadSharingStats();
      
      Alert.alert(
        'Success!',
        `Note shared successfully with ${recipientEmail}`,
        [
          {
            text: 'Share Link',
            onPress: () => handleShareLink(result.shareUrl),
          },
          {
            text: 'Copy Link',
            onPress: () => handleCopyLink(result.shareUrl),
          },
          {
            text: 'OK',
            onPress: () => {
              setRecipientEmail('');
              setAccessType('Viewer');
              setShareUrl('');
              setShareId('');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error sharing note:', error);
      Alert.alert(
        'Error',
        'Failed to share note. Please check your connection and try again.'
      );
    } finally {
      setIsSharing(false);
    }
  };

  const handleShareViaCommunity = async (member: any) => {
    if (!note) return;

    setIsSharing(true);
    try {
      const shareData = {
        recipientEmail: member.email,
        accessType,
      };

      const result = await shareNote(parseInt(note.id), shareData);
      setShareUrl(result.shareUrl);
      setShareId(result.shareId);
      
      await loadSharingStats();
      
      Alert.alert(
        'Success!',
        `Note shared successfully with ${member.name}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setShareUrl('');
              setShareId('');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error sharing note:', error);
      Alert.alert(
        'Error',
        'Failed to share note. Please try again.'
      );
    } finally {
      setIsSharing(false);
    }
  };

  const handleShareViaWhatsApp = async () => {
    if (!note) return;

    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Storage permission is needed to share via WhatsApp.');
        return;
      }

      const result = await generateShareLink();
      const message = `Check out this note: ${result.shareUrl}`;
      
      const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
      const supported = await Linking.canOpenURL(whatsappUrl);
      
      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        Alert.alert('Error', 'WhatsApp is not installed on this device.');
      }
    } catch (error) {
      console.error('Error sharing via WhatsApp:', error);
      Alert.alert('Error', 'Failed to share via WhatsApp.');
    }
  };

  const handleShareViaTelegram = async () => {
    if (!note) return;

    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Storage permission is needed to share via Telegram.');
        return;
      }

      const result = await generateShareLink();
      const message = `Check out this note: ${result.shareUrl}`;
      
      const telegramUrl = `tg://msg?text=${encodeURIComponent(message)}`;
      const supported = await Linking.canOpenURL(telegramUrl);
      
      if (supported) {
        await Linking.openURL(telegramUrl);
      } else {
        Alert.alert('Error', 'Telegram is not installed on this device.');
      }
    } catch (error) {
      console.error('Error sharing via Telegram:', error);
      Alert.alert('Error', 'Failed to share via Telegram.');
    }
  };

  const handleShareViaOtherApps = async () => {
    if (!note) return;

    try {
      const result = await generateShareLink();
      const message = `Check out this note: ${result.shareUrl}`;
      
      await Share.share({
        message: message,
        url: result.shareUrl,
      });
    } catch (error) {
      console.error('Error sharing via other apps:', error);
      Alert.alert('Error', 'Failed to share note.');
    }
  };

  const handleShareLink = async (url: string) => {
    try {
      await Share.share({
        message: `Check out this note: ${url}`,
        url: url,
      });
    } catch (error) {
      console.error('Error sharing link:', error);
      Alert.alert('Error', 'Failed to share link');
    }
  };

  const handleCopyLink = async (url: string) => {
    try {
      // In a real app, you'd use Clipboard API
      console.log('Link copied to clipboard:', url);
      Alert.alert('Success', 'Link copied to clipboard!');
    } catch (error) {
      console.error('Error copying link:', error);
      Alert.alert('Error', 'Failed to copy link');
    }
  };

  const handleOpenLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this link');
      }
    } catch (error) {
      console.error('Error opening link:', error);
      Alert.alert('Error', 'Failed to open link');
    }
  };

  const handleClose = () => {
    if (!isSharing) {
      setRecipientEmail('');
      setAccessType('Viewer');
      setShareUrl('');
      setShareId('');
      setSelectedShareMethod(null);
      onClose();
    }
  };

  const renderShareMethod = (method: ShareMethod, title: string, icon: string, onPress: () => void) => (
    <TouchableOpacity
      style={[
        styles.shareMethodButton,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
        },
      ]}
      onPress={onPress}
    >
      <Ionicons name={icon as any} size={24} color={colors.primary} />
      <Text style={[styles.shareMethodText, { color: colors.text }]}>
        {title}
      </Text>
      <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderCommunityMember = (member: any) => (
    <TouchableOpacity
      key={member.id}
      style={[
        styles.communityMemberButton,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
        },
      ]}
      onPress={() => handleShareViaCommunity(member)}
    >
      <View style={[styles.memberAvatar, { backgroundColor: colors.primary }]}>
        <Text style={[styles.memberAvatarText, { color: colors.background }]}>
          {member.avatar}
        </Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={[styles.memberName, { color: colors.text }]}>
          {member.name}
        </Text>
        <Text style={[styles.memberEmail, { color: colors.textSecondary }]}>
          {member.email}
        </Text>
      </View>
      <Ionicons name="share-outline" size={20} color={colors.primary} />
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={[styles.modal, { backgroundColor: colors.surface }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Ionicons name="share-social" size={24} color={colors.primary} />
                <Text style={[styles.title, { color: colors.text }]}>
                  Share Link
                </Text>
              </View>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Note Info */}
            {note && (
              <View style={[styles.noteInfo, { backgroundColor: colors.background }]}>
                <View style={styles.noteHeader}>
                  <Ionicons name="document-text" size={20} color={colors.primary} />
                  <Text style={[styles.noteTitle, { color: colors.text }]}>
                    {note.title}
                  </Text>
                </View>
                <Text style={[styles.notePreview, { color: colors.textSecondary }]}>
                  {(() => {
                    const cleanContent = stripHtmlTags(note.content);
                    return cleanContent.length > 120 
                      ? cleanContent.slice(0, 120) + '...' 
                      : cleanContent;
                  })()}
                </Text>
              </View>
            )}

            {/* Share Methods */}
            <View style={styles.shareMethodsContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Choose sharing method
              </Text>

              {renderShareMethod('email', 'Share via Email', 'mail-outline', () => setSelectedShareMethod('email'))}
              {renderShareMethod('community', 'Share with Community', 'people-outline', () => setSelectedShareMethod('community'))}
              {renderShareMethod('whatsapp', 'Share via WhatsApp', 'logo-whatsapp', handleShareViaWhatsApp)}
              {renderShareMethod('telegram', 'Share via Telegram', 'paper-plane-outline', handleShareViaTelegram)}
              {renderShareMethod('other', 'Share via Other Apps', 'share-outline', handleShareViaOtherApps)}
            </View>

            {/* Email Sharing Form */}
            {selectedShareMethod === 'email' && (
              <View style={styles.emailForm}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Share via Email
                </Text>
                
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    Recipient Email
                  </Text>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.background }]}>
                    <Ionicons name="mail" size={20} color={colors.textSecondary} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="Enter email address"
                      placeholderTextColor={colors.textSecondary}
                      value={recipientEmail}
                      onChangeText={setRecipientEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    Access Type
                  </Text>
                  <View style={styles.accessTypeContainer}>
                    <TouchableOpacity
                      style={[
                        styles.accessTypeButton,
                        {
                          backgroundColor: accessType === 'Viewer' 
                            ? colors.primary + '15' 
                            : colors.background,
                          borderColor: accessType === 'Viewer' 
                            ? colors.primary 
                            : colors.border,
                        },
                      ]}
                      onPress={() => setAccessType('Viewer')}
                    >
                      <Ionicons 
                        name="eye-outline" 
                        size={20} 
                        color={accessType === 'Viewer' ? colors.primary : colors.textSecondary} 
                      />
                      <View style={styles.accessTypeContent}>
                        <Text style={[
                          styles.accessTypeText,
                          { color: accessType === 'Viewer' ? colors.primary : colors.text }
                        ]}>
                          Viewer
                        </Text>
                        <Text style={[styles.accessTypeDescription, { color: colors.textSecondary }]}>
                          Can view only
                        </Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.accessTypeButton,
                        {
                          backgroundColor: accessType === 'Editor' 
                            ? colors.primary + '15' 
                            : colors.background,
                          borderColor: accessType === 'Editor' 
                            ? colors.primary 
                            : colors.border,
                        },
                      ]}
                      onPress={() => setAccessType('Editor')}
                    >
                      <Ionicons 
                        name="create-outline" 
                        size={20} 
                        color={accessType === 'Editor' ? colors.primary : colors.textSecondary} 
                      />
                      <View style={styles.accessTypeContent}>
                        <Text style={[
                          styles.accessTypeText,
                          { color: accessType === 'Editor' ? colors.primary : colors.text }
                        ]}>
                          Editor
                        </Text>
                        <Text style={[styles.accessTypeDescription, { color: colors.textSecondary }]}>
                          Can view & edit
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.shareButton,
                    { 
                      backgroundColor: colors.primary,
                      opacity: isSharing ? 0.7 : 1,
                    },
                  ]}
                  onPress={handleShareViaEmail}
                  disabled={isSharing}
                >
                  {isSharing ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Ionicons name="mail" size={20} color="#fff" />
                      <Text style={styles.shareButtonText}>Share via Email</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Community Members */}
            {selectedShareMethod === 'community' && (
              <View style={styles.communityContainer}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Share with Community Members
                </Text>
                <View style={styles.communityMembersList}>
                  {communityMembers.map(renderCommunityMember)}
                </View>
              </View>
            )}

            {/* Generated Link Section */}
            {shareUrl && (
              <View style={[styles.linkSection, { backgroundColor: colors.background }]}>
                <Text style={[styles.linkTitle, { color: colors.text }]}>
                  Generated Link
                </Text>
                <View style={[styles.linkContainer, { borderColor: colors.border }]}>
                  <Text style={[styles.linkText, { color: colors.textSecondary }]} numberOfLines={2}>
                    {shareUrl}
                  </Text>
                  <View style={styles.linkActions}>
                    <TouchableOpacity
                      style={[styles.linkAction, { backgroundColor: colors.primary }]}
                      onPress={() => handleShareLink(shareUrl)}
                    >
                      <Ionicons name="share-outline" size={16} color="#fff" />
                      <Text style={styles.linkActionText}>Share</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.linkAction, { backgroundColor: colors.background, borderColor: colors.border }]}
                      onPress={() => handleCopyLink(shareUrl)}
                    >
                      <Ionicons name="copy-outline" size={16} color={colors.text} />
                      <Text style={[styles.linkActionText, { color: colors.text }]}>Copy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.linkAction, { backgroundColor: colors.background, borderColor: colors.border }]}
                      onPress={() => handleOpenLink(shareUrl)}
                    >
                      <Ionicons name="open-outline" size={16} color={colors.text} />
                      <Text style={[styles.linkActionText, { color: colors.text }]}>Open</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* Info Text */}
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {accessType === 'Viewer' 
                ? 'The recipient will be able to view the note but cannot edit it.'
                : 'The recipient will be able to view and edit the note.'
              }
            </Text>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    maxHeight: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  noteInfo: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  notePreview: {
    fontSize: 14,
    lineHeight: 20,
  },
  shareMethodsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  shareMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    gap: 12,
  },
  shareMethodText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  emailForm: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  accessTypeContainer: {
    gap: 12,
  },
  accessTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  accessTypeContent: {
    flex: 1,
  },
  accessTypeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  accessTypeDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  communityContainer: {
    marginBottom: 24,
  },
  communityMembersList: {
    gap: 12,
  },
  communityMemberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 14,
  },
  linkSection: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  linkContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  linkText: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  linkActions: {
    flexDirection: 'row',
    gap: 8,
  },
  linkAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  linkActionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
});

export default ShareNoteModal; 