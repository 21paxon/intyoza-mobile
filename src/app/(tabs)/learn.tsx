import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Screen, Surface } from '@/components/Screen';
import { Heading, Body, Caption } from '@/components/Text';
import { LoadingState, EmptyState } from '@/components/DataStates';
import { colors, spacing } from '@/constants/theme';
import { learningApi } from '@/api/endpoints';
import type { Article, Category } from '@/types/api';
import { apiMessage } from '@/utils/apiValue';

export default function LearnScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [categoryResponse, articleResponse] = await Promise.all([learningApi.categories(), learningApi.articles({ categoryId, language: 'EN' })]);
      setCategories(categoryResponse.data.categories ?? []);
      setArticles(articleResponse.data.articles ?? []);
    } catch (e) { setError(apiMessage(e)); }
    finally { setLoading(false); }
  }, [categoryId]);
  useEffect(() => { load(); }, [load]);
  return (
    <Screen>
      <View style={styles.intro}><Caption>LEARNING HUB</Caption><Heading>Learn at your own pace</Heading><Body>Explore clear, practical information created for young people.</Body></View>
      <View style={styles.filters}>
        <Filter label="All topics" selected={!categoryId} onPress={() => setCategoryId(undefined)} />
        {categories.map((category) => <Filter key={category.id} label={category.nameEn} selected={category.id === categoryId} onPress={() => setCategoryId(category.id)} />)}
      </View>
      {loading ? <LoadingState label="Finding learning resources…" /> : error ? <EmptyState title="Could not load learning" detail={error} /> : articles.length === 0 ? <EmptyState title="No articles yet" detail="Try another topic or check back later." /> : articles.map((article) => (
        <Surface key={article.id} style={styles.article}>
          <View style={styles.badges}><Caption style={styles.badge}>{article.format.replaceAll('_', ' ')}</Caption>{article.isLowData ? <Caption style={styles.badge}>LOW DATA</Caption> : null}</View>
          <Heading style={styles.articleTitle}>{article.title}</Heading>
          <Body style={styles.articleCopy}>This resource is available in {article.language === 'RW' ? 'Kinyarwanda' : 'English'}.</Body>
        </Surface>
      ))}
      <Caption style={styles.note}>The learning API currently returns article summaries only; full article content is not available through its documented routes.</Caption>
    </Screen>
  );
}

function Filter({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.filter, selected && styles.filterSelected]}><Caption style={selected ? styles.filterTextSelected : undefined}>{label}</Caption></Pressable>;
}

const styles = StyleSheet.create({ intro: { gap: spacing.sm }, filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, filter: { paddingVertical: 9, paddingHorizontal: 13, borderRadius: 20, backgroundColor: colors.white, borderColor: colors.line, borderWidth: 1 }, filterSelected: { backgroundColor: colors.forest, borderColor: colors.forest }, filterTextSelected: { color: colors.white, fontWeight: '700' }, article: { gap: spacing.sm }, badges: { flexDirection: 'row', gap: 7 }, badge: { color: colors.forest, backgroundColor: colors.mint, overflow: 'hidden', paddingVertical: 5, paddingHorizontal: 9, borderRadius: 12, fontSize: 10, fontWeight: '700' }, articleTitle: { fontSize: 19, lineHeight: 25 }, articleCopy: { color: colors.muted }, note: { textAlign: 'center', padding: spacing.md } });
