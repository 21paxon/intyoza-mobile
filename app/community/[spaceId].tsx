import React, { useCallback, useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Screen, Surface } from '@/components/Screen';
import { Heading, Body, Caption } from '@/components/Text';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';
import { LoadingState, EmptyState } from '@/components/DataStates';
import { colors, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { communityApi } from '@/api/endpoints';
import { apiMessage, collectionFrom, recordValue } from '@/utils/apiValue';

const schema = z.object({ content: z.string().trim().min(1, 'Write a message first.').max(2000, 'Please keep posts under 2,000 characters.') });
type Values = z.infer<typeof schema>;

export default function SpaceScreen() {
  const { spaceId } = useLocalSearchParams<{ spaceId: string }>();
  const { token } = useAuth();
  const [posts, setPosts] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const { control, handleSubmit, reset, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { content: '' } });
  const load = useCallback(async () => {
    if (!token || !spaceId) return;
    setLoading(true); setError('');
    try { const response = await communityApi.posts(spaceId); setPosts(collectionFrom(response.data)); }
    catch (e) { setError(apiMessage(e)); }
    finally { setLoading(false); }
  }, [token, spaceId]);
  useEffect(() => { load(); }, [load]);

  const submit = handleSubmit(async ({ content }) => {
    setPosting(true);
    try { await communityApi.createPost(spaceId, content); reset(); await load(); }
    catch (e) { Alert.alert('Post not published', apiMessage(e)); }
    finally { setPosting(false); }
  });

  if (!token) return <Screen><EmptyState title="Sign in to view this space" /><Button title="Sign in" onPress={() => router.push('/(auth)/login')} /></Screen>;

  return (
    <Screen>
      <View style={styles.intro}><Caption>PEER SUPPORT</Caption><Heading>Share with your community</Heading><Body>Post a thought or question. Please avoid sharing details that could identify you or someone else.</Body></View>
      <Surface style={styles.form}><Controller control={control} name="content" render={({ field: { onChange, value } }) => <Field label="Your post" placeholder="What's on your mind?" value={value} onChangeText={onChange} multiline maxLength={2000} error={errors.content?.message} />} /><Button title="Publish post" onPress={submit} loading={posting} /></Surface>
      {loading ? <LoadingState label="Loading posts…" /> : error ? <EmptyState title="Could not load posts" detail={error} /> : posts.length === 0 ? <EmptyState title="No posts yet" detail="You can be the first to start a conversation." /> : posts.map((post, index) => {
        const values = recordValue(post);
        const id = values && Object.entries(values).find(([key, value]) => /(^id$|postid$)/i.test(key) && typeof value === 'string')?.[1];
        const postText = values ? Object.entries(values).find(([key, value]) => !/id|date|time|author|user/i.test(key) && typeof value === 'string')?.[1] : undefined;
        return <Surface key={String(id ?? index)} style={styles.post}><Caption>COMMUNITY POST</Caption><Body>{String(postText ?? JSON.stringify(post))}</Body>{id ? <Button title="Report this post" secondary onPress={() => router.push({ pathname: '/community/report', params: { postId: String(id) } })} /> : null}</Surface>;
      })}
      <Caption style={styles.note}>Reports are sent to the Intyoza team for review.</Caption>
    </Screen>
  );
}

const styles = StyleSheet.create({ intro: { gap: spacing.sm }, form: { gap: spacing.md }, post: { gap: spacing.md }, note: { textAlign: 'center' } });
