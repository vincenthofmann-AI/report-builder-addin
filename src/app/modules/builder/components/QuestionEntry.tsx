/**
 * QuestionEntry Component
 * ========================
 *
 * Conversational entry point for report building.
 * Users can:
 * - Select from suggested questions
 * - Search questions by keyword
 * - Type their own question (for future AI interpretation)
 */

import { useState } from 'react';
import { Search, Sparkles, ArrowRight } from 'lucide-react';
import { SearchInput, Button, ButtonType, Card } from '../../../services/zenith-adapter';
import {
  QUESTION_TEMPLATES,
  searchQuestions,
  getRecommendedQuestions,
  type QuestionTemplate,
} from '../types/question-templates';

interface QuestionEntryProps {
  onSelectQuestion: (template: QuestionTemplate) => void;
  onSkipToCustom: () => void;
}

export function QuestionEntry({ onSelectQuestion, onSkipToCustom }: QuestionEntryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    QuestionTemplate['category'] | 'all'
  >('all');

  // Filter questions based on search and category
  const filteredQuestions =
    searchQuery.length > 0
      ? searchQuestions(searchQuery)
      : selectedCategory === 'all'
      ? getRecommendedQuestions(12)
      : QUESTION_TEMPLATES.filter((q) => q.category === selectedCategory);

  const categories = [
    { id: 'all' as const, label: 'Recommended', icon: Sparkles },
    { id: 'fleet' as const, label: 'Fleet Activity', icon: null },
    { id: 'safety' as const, label: 'Safety', icon: null },
    { id: 'performance' as const, label: 'Performance', icon: null },
    { id: 'compliance' as const, label: 'Compliance', icon: null },
    { id: 'location' as const, label: 'Location', icon: null },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#f8fafc',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '32px 32px 24px 32px',
          backgroundColor: 'white',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <h1
          style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#0f172a',
            margin: '0 0 8px 0',
          }}
        >
          What would you like to know?
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: '#64748b',
            margin: '0 0 24px 0',
          }}
        >
          Choose a question to get started, or build your own custom report
        </p>

        {/* Search Bar */}
        <SearchInput
          placeholder="Search for reports or ask a question..."
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      {/* Category Filters */}
      <div
        style={{
          padding: '16px 32px',
          backgroundColor: 'white',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
        }}
      >
        {categories.map((category) => {
          const isActive = selectedCategory === category.id;
          const IconComponent = category.icon;

          return (
            <Button
              key={category.id}
              type={isActive ? ButtonType.Primary : ButtonType.Secondary}
              onClick={() => setSelectedCategory(category.id)}
            >
              {IconComponent && <IconComponent style={{ width: '16px', height: '16px' }} />}
              {category.label}
            </Button>
          );
        })}
      </div>

      {/* Question Cards Grid */}
      <div
        style={{
          flex: '1',
          overflowY: 'auto',
          padding: '24px 32px',
        }}
      >
        {filteredQuestions.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '64px 16px',
            }}
          >
            <p style={{ fontSize: '14px', color: '#94a3b8', margin: '0 0 16px 0' }}>
              No questions found for "{searchQuery}"
            </p>
            <Button type={ButtonType.Secondary} onClick={() => setSearchQuery('')}>
              Clear search
            </Button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '16px',
            }}
          >
            {filteredQuestions.map((template) => {
              const IconComponent = template.icon;

              return (
                <button
                  key={template.id}
                  onClick={() => onSelectQuestion(template)}
                  style={{
                    padding: '20px',
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#003a63';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 58, 99, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        backgroundColor: '#f0f7ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <IconComponent style={{ width: '20px', height: '20px', color: '#003a63' }} />
                    </div>
                    <div style={{ flex: '1', minWidth: 0 }}>
                      <h3
                        style={{
                          fontSize: '15px',
                          fontWeight: '500',
                          color: '#0f172a',
                          margin: '0 0 8px 0',
                          lineHeight: '1.4',
                        }}
                      >
                        {template.question}
                      </h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {template.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            style={{
                              fontSize: '11px',
                              color: '#64748b',
                              backgroundColor: '#f1f5f9',
                              padding: '2px 8px',
                              borderRadius: '12px',
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <ArrowRight
                      style={{
                        width: '16px',
                        height: '16px',
                        color: '#94a3b8',
                        flexShrink: 0,
                        marginTop: '2px',
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Custom Report Option */}
        <div
          style={{
            marginTop: '32px',
            padding: '24px',
            backgroundColor: 'white',
            border: '2px dashed #cbd5e1',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: '14px',
              color: '#64748b',
              margin: '0 0 16px 0',
            }}
          >
            Don't see what you need?
          </p>
          <Button type={ButtonType.Tertiary} onClick={onSkipToCustom}>
            Build a custom report →
          </Button>
        </div>
      </div>
    </div>
  );
}
