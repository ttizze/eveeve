interface SystemMessageBody {
  target_language: string
  source_text: string
  translationMode: string
}

export function generateSystemMessage(body: SystemMessageBody): string {
  if (body.translationMode === 'read') {
    return `You will be translating some HTML content from one language to another while following specific guidelines. 

    Here is the source HTML to translate:
    <source_text>
    {{${body.source_text}}}
    </source_text>
    
    Please translate the above HTML into this target language:
    <target_language>
    {{${body.target_language}}}
    </target_language>
    
    Follow these translation guidelines closely:
    - Translate the text within <text> tags while maintaining context and using natural language for the target language
    - Adjust the positioning of the translated text to match the source language as closely as possible, considering the differences between the source and target languages.
    - Do not translate the data-uuid attribute values within the <text> tags
    - Do not translate any text inside <code> tags, even if it contains nested <text> tags
    - However, if a <code> tag seems to flow directly with the surrounding texts, make sure to still translate that surrounding text appropriately
    - If the translated text for a given <text> tag does not fit naturally in that tag's spot, output that tag as empty (i.e., <text data-uuid="X"></text>)
    - Make sure the translation matches up perfectly with the data-uuid values of the source text to maintain alignment
    
    Here is an example of how to properly translate HTML following those rules:
    
    <example>
    <source_text>
    <text data-uuid="1">This is</text><text data-uuid="2"> an example of translation.</text><text data-uuid="3"> Please place the text in the same position as the source text as much as possible</text><text data-uuid="4">.</text><code><text data-uuid="5">This example</text></code><text data-uuid="6"> demonstrates how to translate HTML.</text>  
    </source_text>
    
    <target_language>
    Japanese
    </target_language>
    
    <translation_result>
    <text data-uuid="1">これは</text><text data-uuid="2">翻訳の例です。</text><text data-uuid="3"></text>原文とできる限り同じ位置にテキストを配置してください<text data-uuid="4">。</text><code><text data-uuid="5">This example</text></code><text data-uuid="6">ではHTMLの翻訳方法を示しています。</text>
    </translation_result>
    </example>
    
    To summarize the key points:
    - Translate only the text within <text> tags, except for ones inside <code> tags
    - When translating into languages that require word segmentation, such as English, insert spaces at appropriate places, such as before or after the translated tex.
    - Leave data-uuid attributes untranslated 
    - Output empty texts if the translation doesn't fit
    - Make sure the data-uuid values match between the source and translated HTML to keep everything aligned
    
    Please output ONLY the translated HTML content, wrapped in <translation_result> tags, with no other text or explanation. The result should have the same number of texts as the source.
  `
  }

  return `Here is the source text to translate:
  <source_text>
  ${body.source_text}
  </source_text>
  
  Please translate the above text into this target language: 
  <target_language>${body.target_language}</target_language>
  
  Follow these translation guidelines carefully:
  <translation_guidelines>
  - Translate the text while maintaining the original meaning and context as much as possible
  - Use natural, fluent language in the target language
  - Do not transliterate names or places - translate them if a translated version exists, otherwise leave them in the original language
  - Do not add any additional explanations or commentary beyond the original text
  </translation_guidelines>
  
  Read the source text and translation guidelines carefully. Then translate the source text into the specified target language, following the provided guidelines closely. 
  Output ONLY the translated text inside  without any additional text, commentary or tags.
  `
}
