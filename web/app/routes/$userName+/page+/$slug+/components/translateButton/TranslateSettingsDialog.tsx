import { Form } from '@remix-run/react';
import { useNavigation } from '@remix-run/react';
import { useState } from 'react';
import { LoadingSpinner } from '~/components/LoadingSpinner';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { GeminiApiKeyDialog } from '~/routes/resources+/gemini-api-key-dialog';
import TargetLanguageSelector  from './TargetLanguageSelector';

type TranslateSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageId: number;
  targetLanguage: string;
  hasGeminiApiKey: boolean;
};

export function TranslateSettingsDialog({
  open,
  onOpenChange,
	pageId,
	targetLanguage,
	hasGeminiApiKey,
}: TranslateSettingsDialogProps) {
	const [selectedModel, setSelectedModel] = useState("gemini-1.5-flash");
  const navigation = useNavigation();
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Translation Settings</DialogTitle>
          </DialogHeader>
          <Form method="post" className="space-y-4">
            <input type="hidden" name="pageId" value={pageId} />
            <input type="hidden" name="aiModel" value={selectedModel} />
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Language</label>
              <TargetLanguageSelector targetLanguage={targetLanguage} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">AI Model</label>
              <select
                className="w-full rounded-md border"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
              </select>
            </div>

            {hasGeminiApiKey ? (
              <Button
                type="submit"
                name="intent"
                value="translate"
                className="w-full"
                disabled={navigation.state === 'submitting'}
              >
                {navigation.state === 'submitting' ? (
                  <LoadingSpinner />
                ) : (
                  'Translate'
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => setIsApiKeyDialogOpen(true)}
                className="w-full"
              >
                Set API Key
              </Button>
            )}
          </Form>
        </DialogContent>
      </Dialog>

      <GeminiApiKeyDialog
        isOpen={isApiKeyDialogOpen}
        onOpenChange={setIsApiKeyDialogOpen}
      />
    </>
  );
} 