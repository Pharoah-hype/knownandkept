'use client'

import TopicCard from './TopicCard'

const ORDERED_TOPICS = [
  'anxiety',
  'marriage',
  'grief',
  'identity',
  'addiction recovery',
  'parenting',
  'loneliness',
  'purpose',
]

interface TopicData {
  topic: string
  memberCount: number
}

interface TopicSliderProps {
  topics: TopicData[]
  onSelect: (topic: string) => void
}

export default function TopicSlider({ topics, onSelect }: TopicSliderProps) {
  const topicMap = new Map(topics.map(t => [t.topic, t.memberCount]))

  const topicsWithCounts: TopicData[] = ORDERED_TOPICS.map(t => ({
    topic: t,
    memberCount: topicMap.get(t) ?? 0,
  }))

  const maxCount = Math.max(...topicsWithCounts.map(t => t.memberCount), 0)

  return (
    <div>
      <div
        style={{
          overflowX: 'auto',
          display: 'flex',
          flexDirection: 'row',
          gap: '12px',
          paddingLeft: '22px',
          paddingRight: '22px',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
        className="hide-scrollbar"
      >
        {topicsWithCounts.map((t, i) => (
          <TopicCard
            key={t.topic}
            topic={t.topic}
            memberCount={t.memberCount}
            isActive={t.memberCount === maxCount && maxCount > 0}
            index={i}
            onClick={() => onSelect(t.topic)}
          />
        ))}
      </div>
      <p
        style={{
          fontSize: '12px',
          fontFamily: 'Georgia, serif',
          fontStyle: 'italic',
          color: '#4a4843',
          textAlign: 'center',
          marginTop: '24px',
        }}
      >
        you leave when you&apos;re ready. no history follows you.
      </p>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}
