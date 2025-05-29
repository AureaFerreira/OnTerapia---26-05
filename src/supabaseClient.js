// src/supabaseClient.js

import 'react-native-url-polyfill/auto'; // ESSA LINHA É CRÍTICA E DEVE SER A PRIMEIRA!

import { createClient } from '@supabase/supabase-js';

// Suas credenciais Supabase
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://eosohkgpqyeawhlpsavc.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvc29oa2dwcXllYXdobHBzYXZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2NTk4MjksImV4cCI6MjA1MzIzNTgyOX0.EELhgYnGynx01xAWIGokrpNbt-MLXA8um5hrEcJj_nY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);