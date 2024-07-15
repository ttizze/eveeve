import type React from "react";
import { useState, useRef, useEffect } from "react";
import parse from "html-react-parser";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { ThumbsUp, ThumbsDown, Edit, Plus, X } from "lucide-react";
import type { TranslationData } from "../types";

interface TranslatedContentProps {
  content: string;
  translations: Array<{ number: number; translations: TranslationData[] }>;
  targetLanguage: string;
  onVote: (translationId: number, isUpvote: boolean) => void;
  onAdd: (sourceTextId: number, text: string) => void;
  userId: number | null;
}

const Translation: React.FC<{
  translation: TranslationData;
  alternativeTranslations: TranslationData[];
  targetLanguage: string;
  onVote: (isUpvote: boolean) => void;
  onAdd: (text: string) => void;
  userId: number | null;
  sourceTextId: number;
}> = ({ translation, alternativeTranslations, targetLanguage, onVote, onAdd, userId, sourceTextId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(translation.text);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={ref}
      lang={targetLanguage}
      className="notranslate mt-2 p-2 bg-gray-100 rounded-md group relative"
    >
      <div>{translation.text}</div>
      <Button
        variant="outline"
        size="sm"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
      >
        {isExpanded ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      </Button>
      {isExpanded && (
        <div className="mt-2">
          <div className="flex justify-between items-center">
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onVote(true)}
                disabled={!userId}
              >
                <ThumbsUp className={`mr-2 h-4 w-4 ${translation.userVoteStatus === 'upvoted' ? 'text-blue-500' : ''}`} />
                {translation.point}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onVote(false)}
                disabled={!userId}
              >
                <ThumbsDown className={`mr-2 h-4 w-4 ${translation.userVoteStatus === 'downvoted' ? 'text-red-500' : ''}`} />
              </Button>
            </div>
            {userId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit className="mr-2 h-4 w-4" />
                編集
              </Button>
            )}
          </div>
          {isEditing && (
            <div className="mt-2">
              <Textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full mb-2"
              />
              <div className="space-x-2">
                <Button onClick={() => {
                  onAdd(editText);
                  setIsEditing(false);
                }}>保存</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>キャンセル</Button>
              </div>
            </div>
          )}
          {alternativeTranslations.length > 0 && (
            <div className="mt-2">
              <h4>他の翻訳候補:</h4>
              {alternativeTranslations.map((alt) => (
                <div key={alt.id} className="mt-1 p-2 bg-white rounded border">
                  <div>{alt.text}</div>
                  <div className="text-xs text-gray-500">翻訳者: {alt.userName} / ポイント: {alt.point}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export function TranslatedContent({
  content,
  translations,
  targetLanguage,
  onVote,
  onAdd,
  userId
}: TranslatedContentProps) {
  if (typeof window === 'undefined') {
    return <div>Loading...</div>;
  }

  const doc = new DOMParser().parseFromString(content, 'text/html');

  for (const { number } of translations) {
    const element = doc.querySelector(`[data-number="${number}"]`);
    if (element) {
      const translationElement = doc.createElement('div');
      translationElement.setAttribute('data-translation', number.toString());
      element.appendChild(translationElement);
    }
  }

  return (
    <>
      {parse(doc.body.innerHTML, {
        replace: (domNode) => {
          if (domNode.type === 'tag' && domNode.attribs['data-translation']) {
            const number = Number.parseInt(domNode.attribs['data-translation'], 10);
            const translationGroup = translations.find(t => t.number === number);
            if (translationGroup && translationGroup.translations.length > 0) {
              const [bestTranslation, ...alternativeTranslations] = translationGroup.translations;
              return (
                <Translation
                  key={`translation-${bestTranslation.id}`}
                  translation={bestTranslation}
                  alternativeTranslations={alternativeTranslations}
                  targetLanguage={targetLanguage}
                  onVote={(isUpvote) => onVote(bestTranslation.id, isUpvote)}
                  onAdd={(text) => onAdd(number, text)}
                  userId={userId}
                  sourceTextId={number}
                />
              );
            }
          }
          return domNode;
        }
      })}
    </>
  );
}