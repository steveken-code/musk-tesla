 import { useState, useEffect, useRef } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 import { countryCodeMap, extractFirstName, roundAmount, getCountryFromCode } from '@/data/liveActivityData';
 
 export interface RealInvestment {
   id: string;
   firstName: string;
   amount: number;
   country: string;
   countryCode: string;
   flag: string;
   createdAt: Date;
 }
 
 export const useRealInvestments = () => {
   const [realInvestments, setRealInvestments] = useState<RealInvestment[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const fetchedRef = useRef(false);
 
   useEffect(() => {
     // Only fetch once
     if (fetchedRef.current) return;
     fetchedRef.current = true;
 
     const fetchInvestments = async () => {
       try {
         // Fetch recent investments with profile info
         // Note: This uses RLS - will only show data based on current user's access
         // For public display, we fetch active/completed investments
         const { data: investments, error } = await supabase
           .from('investments')
           .select(`
             id,
             amount,
             created_at,
             user_id
           `)
           .in('status', ['active', 'completed'])
           .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
           .order('created_at', { ascending: false })
           .limit(50);
 
         if (error) {
           console.log('Could not fetch investments for live feed (RLS may restrict access)');
           setIsLoading(false);
           return;
         }
 
         if (!investments || investments.length === 0) {
           setIsLoading(false);
           return;
         }
 
         // Get unique user IDs
         const userIds = [...new Set(investments.map(inv => inv.user_id))];
 
         // Fetch profiles for these users
         const { data: profiles } = await supabase
           .from('profiles')
           .select('user_id, full_name')
           .in('user_id', userIds);
 
         // Fetch withdrawals to get country info
         const { data: withdrawals } = await supabase
           .from('withdrawals')
           .select('user_id, country')
           .in('user_id', userIds);
 
         // Create lookup maps
         const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);
         const countryMap = new Map(withdrawals?.map(w => [w.user_id, w.country]) || []);
 
         // Transform investments
         const transformed: RealInvestment[] = investments.map(inv => {
           const fullName = profileMap.get(inv.user_id);
           const countryCode = countryMap.get(inv.user_id) || 'US';
           const countryInfo = getCountryFromCode(countryCode);
 
           return {
             id: inv.id,
             firstName: extractFirstName(fullName),
             amount: roundAmount(inv.amount),
             country: countryInfo?.name || 'United States',
             countryCode: countryCode,
             flag: countryInfo?.flag || '🇺🇸',
             createdAt: new Date(inv.created_at),
           };
         });
 
         setRealInvestments(transformed);
       } catch (err) {
         console.log('Error fetching investments for live feed:', err);
       } finally {
         setIsLoading(false);
       }
     };
 
     fetchInvestments();
   }, []);
 
   return { realInvestments, isLoading };
 };