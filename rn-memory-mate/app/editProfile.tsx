import { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Button, Text, TextInput, useTheme, Appbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spacings } from '@/constants/Spacings';
import Spacer from '@/components/Spacer';
import { supabase } from '@/helpers/supabase';
import { useRouter } from 'expo-router';

export default function EditProfile() {
  const theme = useTheme();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [username, setUsername] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the current user and profile data
    async function fetchUserProfile() {
      try {
        setLoading(true);
        
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setUserId(user.id);
          
          // Get the user's profile information
          const { data, error } = await supabase
            .from('profiles')
            .select('username, full_name')
            .eq('id', user.id)
            .single();
            
          if (error) {
            console.error('Error fetching profile:', error);
            Alert.alert('Error', 'Failed to load profile information');
          } else if (data) {
            setUsername(data.username || '');
            setFullName(data.full_name || '');
          }
        }
      } catch (error) {
        console.error('Error:', error);
        Alert.alert('Error', 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserProfile();
  }, []);

  async function updateProfile() {
    if (!userId) return;
    
    try {
      setUpdating(true);
      
      const updates = {
        id: userId,
        username,
        full_name: fullName,
        updated_at: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);
        
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Success', 'Profile updated successfully');
        router.back();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text variant="titleMedium">Update your profile information</Text>
        
        <Spacer height={Spacings["3x"]} />
        
        <TextInput
          label="Username"
          value={username}
          onChangeText={setUsername}
          mode="outlined"
          autoCapitalize="none"
        />
        
        <Spacer height={Spacings["2x"]} />
        
        <TextInput
          label="Full Name"
          value={fullName}
          onChangeText={setFullName}
          mode="outlined"
        />
        
        <Spacer height={Spacings["4x"]} />
        
        <Button
          mode="contained"
          onPress={updateProfile}
          loading={updating}
          disabled={updating}
        >
          Save Changes
        </Button>
        
        <Spacer height={Spacings["2x"]} />
        
        <Button
          mode="outlined"
          onPress={() => router.back()}
          disabled={updating}
        >
          Cancel
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: Spacings["3x"],
  },
});