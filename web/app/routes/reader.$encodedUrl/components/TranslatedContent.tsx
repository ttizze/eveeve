import parse from "html-react-parser";

interface TranslatedContentProps {
  content: string;
  translations: Array<{ number: number; text: string }>;
  targetLanguage: string;
}

function Translation({ text, targetLanguage }: { text: string; targetLanguage: string }) {
  return (
    <div
      lang={targetLanguage}
      className="notranslate block mt-2 p-2 bg-gray-100 rounded-md"
    >
      {text}
    </div>
  );
};

export function TranslatedContent({ content, translations, targetLanguage }: TranslatedContentProps) {
  if (typeof window === 'undefined') {
    return <div>Loading...</div>;
  }
  const doc = new DOMParser().parseFromString(content, 'text/html');
  
  for (const { number, text } of translations) {
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
            const translation = translations.find(t => t.number === number);
            if (translation) {
              return <Translation key="translation" text={translation.text} targetLanguage={targetLanguage} />;
            }
          }
          return domNode;
        }
      })}
    </>
  );
}