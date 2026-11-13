import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Screen, Surface } from '@/components/Screen';
import { Heading, Body, Caption } from '@/components/Text';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';
import { LoadingState, EmptyState } from '@/components/DataStates';
import { colors, spacing } from '@/constants/theme';
import { facilitiesApi } from '@/api/endpoints';
import type { Facility } from '@/types/api';
import { apiMessage } from '@/utils/apiValue';

export default function CareScreen() {
  const [district, setDistrict] = useState('');
  const [query, setQuery] = useState('');
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async (districtFilter?: string) => {
    setLoading(true); setError('');
    try { const response = await facilitiesApi.list(districtFilter ? { district: districtFilter } : undefined); setFacilities(response.data.facilities ?? []); }
    catch (e) { setError(apiMessage(e)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const visible = facilities.filter((item) => `${item.name} ${item.district} ${item.sector} ${item.services.map((service) => service.serviceName).join(' ')}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <Screen>
      <View style={styles.intro}><Caption>HEALTH CONNECT</Caption><Heading>Care that meets you where you are</Heading><Body>Browse local services. Contact details are shown when they are available in the backend.</Body></View>
      <Surface style={styles.search}><Field label="District" placeholder="e.g. Gasabo" value={district} onChangeText={setDistrict} /><Button title="Search district" onPress={() => load(district.trim())} loading={loading} secondary /><Field label="Filter results" placeholder="Name, area or service" value={query} onChangeText={setQuery} /></Surface>
      {loading ? <LoadingState label="Finding nearby facilities…" /> : error ? <EmptyState title="Could not load facilities" detail={error} /> : visible.length === 0 ? <EmptyState title="No matching facilities" detail="Try changing your search." /> : <Caption>{visible.length} health facilities</Caption>}
      {visible.map((facility) => <Surface key={facility.id} style={styles.card}>
        <View style={styles.cardHead}><View style={styles.dot} /><Caption>{facility.facilityType}</Caption></View>
        <Heading style={styles.title}>{facility.name}</Heading>
        <Body>{[facility.cell, facility.sector, facility.district].filter(Boolean).join(' • ')}</Body>
        {facility.address ? <Caption>{facility.address}</Caption> : null}
        {facility.phone ? <Body>Phone: {facility.phone}</Body> : null}
        {facility.openingHours ? <Caption>Hours: {facility.openingHours}</Caption> : null}
        <View style={styles.services}>{facility.services.slice(0, 4).map((service) => <Caption key={service.id} style={styles.service}>{service.serviceName.replaceAll('_', ' ').toLowerCase()}</Caption>)}</View>
        {facility.latitude && facility.longitude ? <Caption>Location: {facility.latitude.toFixed(4)}, {facility.longitude.toFixed(4)}</Caption> : null}
      </Surface>)}
      <Caption style={styles.note}>Facility listings come from the Intyoza backend. Please confirm availability and opening hours directly with the facility.</Caption>
    </Screen>
  );
}

const styles = StyleSheet.create({ intro: { gap: spacing.sm }, search: { gap: spacing.md }, card: { gap: spacing.sm }, cardHead: { flexDirection: 'row', alignItems: 'center', gap: 8 }, dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.fern }, title: { fontSize: 18, lineHeight: 24 }, services: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 3 }, service: { color: colors.forest, backgroundColor: colors.mint, paddingVertical: 5, paddingHorizontal: 8, borderRadius: 12, overflow: 'hidden', textTransform: 'capitalize' }, note: { textAlign: 'center', padding: spacing.md } });
