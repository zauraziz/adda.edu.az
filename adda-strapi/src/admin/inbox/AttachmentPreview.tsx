/**
 * F5.38 — müraciətə əlavə edilmiş faylın admin daxilində baxışı.
 *
 * Əvvəl: Content Manager-də fayl kartından linki köçürüb brauzerdə açmaq
 * lazım idi. İndi:
 *   - şəkil  → birbaşa görünür (kliklə tam ölçüdə yeni vərəqdə);
 *   - PDF    → daxili baxıcıda (iframe) açılır;
 *   - Word   → brauzer göstərə bilmir: «Yüklə» / «Yeni vərəqdə aç».
 *     Office Online baxıcısı QƏSDƏN işlədilmir — vətəndaşın sənədi üçüncü
 *     tərəfin serverinə ötürülməsin.
 *
 * `variant="full"` — Bildirişlər səhifəsi (böyük önizləmə);
 * `variant="compact"` — Content Manager yan paneli (kiçik + «Bax» modalı).
 *
 * PDF iframe üçün Strapi CSP-də `frame-src res.cloudinary.com` lazımdır
 * (config/middlewares.ts, F5.38).
 */
import * as React from 'react';
import { Box, Button, Flex, LinkButton, Modal, Typography } from '@strapi/design-system';
import { Download, Eye, ExternalLink, File, FilePdf, Image as ImageIcon } from '@strapi/icons';
import { styled } from 'styled-components';
import { downloadUrl, fileKind, fmtSize, type InboxFile } from './shared';

const Frame = styled.iframe`
  display: block;
  width: 100%;
  border: 0;
  border-radius: ${({ theme }) => theme.borderRadius};
  background: ${({ theme }) => theme.colors.neutral100};
`;

const Img = styled.img`
  display: block;
  max-width: 100%;
  max-height: 520px;
  margin: 0 auto;
  border-radius: ${({ theme }) => theme.borderRadius};
  object-fit: contain;
  cursor: zoom-in;
`;

const Thumb = styled.img`
  display: block;
  width: 100%;
  max-height: 180px;
  border-radius: ${({ theme }) => theme.borderRadius};
  object-fit: cover;
  cursor: zoom-in;
`;

const FileName = styled(Typography)`
  word-break: break-all;
`;

/** Cloudinary PDF çatdırılması bağlıdırsa (401) adminə nə etməli olduğunu de. */
function usePdfBlocked(url: string | undefined, enabled: boolean): boolean {
  const [blocked, setBlocked] = React.useState(false);
  React.useEffect(() => {
    if (!enabled || !url) return;
    let alive = true;
    fetch(url, { method: 'HEAD' })
      .then((r) => {
        if (alive && r.status === 401) setBlocked(true);
      })
      .catch(() => {
        /* CORS və ya şəbəkə — xəbərdarlıq göstərilmir */
      });
    return () => {
      alive = false;
    };
  }, [url, enabled]);
  return blocked;
}

function KindIcon({ kind }: { kind: ReturnType<typeof fileKind> }) {
  if (kind === 'image') return <ImageIcon width="2.4rem" height="2.4rem" fill="primary600" />;
  if (kind === 'pdf') return <FilePdf width="2.4rem" height="2.4rem" fill="danger600" />;
  return <File width="2.4rem" height="2.4rem" fill="neutral600" />;
}

function Actions({ file, onPreview }: { file: InboxFile; onPreview?: () => void }) {
  const url = file.url ?? '';
  return (
    <Flex gap={2} wrap="wrap">
      {onPreview ? (
        <Button size="S" variant="secondary" startIcon={<Eye />} onClick={onPreview}>
          Bax
        </Button>
      ) : null}
      <LinkButton size="S" variant="tertiary" startIcon={<ExternalLink />} href={url} target="_blank" rel="noreferrer">
        Yeni vərəqdə aç
      </LinkButton>
      <LinkButton size="S" variant="tertiary" startIcon={<Download />} href={downloadUrl(url)} target="_blank" rel="noreferrer">
        Yüklə
      </LinkButton>
    </Flex>
  );
}

function PdfHint() {
  return (
    <Box paddingTop={2}>
      <Typography variant="pi" textColor="danger600">
        PDF açılmır (401): Cloudinary → Settings → Security → «Allow delivery of PDF and ZIP files» aktiv edilməlidir.
      </Typography>
    </Box>
  );
}

function Header({ file }: { file: InboxFile }) {
  const kind = fileKind(file);
  return (
    <Flex gap={3} alignItems="center">
      <KindIcon kind={kind} />
      <Flex direction="column" alignItems="flex-start" gap={1}>
        <FileName variant="omega" fontWeight="semiBold">
          {file.name || 'Fayl'}
        </FileName>
        <Typography variant="pi" textColor="neutral600">
          {[kind === 'pdf' ? 'PDF' : kind === 'image' ? 'Şəkil' : kind === 'word' ? 'Word sənədi' : 'Fayl', fmtSize(file.size)]
            .filter(Boolean)
            .join(' · ')}
        </Typography>
      </Flex>
    </Flex>
  );
}

export function AttachmentPreview({ file, variant = 'full' }: { file: InboxFile; variant?: 'full' | 'compact' }) {
  const kind = fileKind(file);
  const url = file.url ?? '';
  const [open, setOpen] = React.useState(false);
  const pdfBlocked = usePdfBlocked(url, kind === 'pdf');
  if (!url) return null;

  const canPreview = kind === 'image' || kind === 'pdf';

  if (variant === 'compact') {
    return (
      <Flex direction="column" alignItems="stretch" gap={3}>
        <Header file={file} />
        {kind === 'image' ? <Thumb src={url} alt={file.name || ''} onClick={() => setOpen(true)} /> : null}
        <Actions file={file} onPreview={canPreview ? () => setOpen(true) : undefined} />
        {pdfBlocked ? <PdfHint /> : null}
        {canPreview ? (
          <Modal.Root open={open} onOpenChange={setOpen}>
            <Modal.Content style={{ maxWidth: '96rem', width: '92vw' }}>
              <Modal.Header>
                <Modal.Title>{file.name || 'Əlavə'}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {kind === 'image' ? (
                  <Img src={url} alt={file.name || ''} onClick={() => window.open(url, '_blank', 'noopener')} />
                ) : (
                  <Frame src={url} title={file.name || 'PDF'} style={{ height: '72vh' }} />
                )}
              </Modal.Body>
              <Modal.Footer>
                <Actions file={file} />
                <Modal.Close>
                  <Button variant="tertiary">Bağla</Button>
                </Modal.Close>
              </Modal.Footer>
            </Modal.Content>
          </Modal.Root>
        ) : null}
      </Flex>
    );
  }

  return (
    <Box hasRadius borderColor="neutral200" borderStyle="solid" borderWidth="1px" padding={4} background="neutral0">
      <Flex justifyContent="space-between" alignItems="center" gap={4} wrap="wrap">
        <Header file={file} />
        <Actions file={file} />
      </Flex>
      {kind === 'image' ? (
        <Box paddingTop={4}>
          <Img src={url} alt={file.name || ''} onClick={() => window.open(url, '_blank', 'noopener')} />
        </Box>
      ) : null}
      {kind === 'pdf' ? (
        <Box paddingTop={4}>
          <Frame src={url} title={file.name || 'PDF'} style={{ height: '640px' }} />
          {pdfBlocked ? <PdfHint /> : null}
        </Box>
      ) : null}
      {kind === 'word' ? (
        <Box paddingTop={3}>
          <Typography variant="pi" textColor="neutral600">
            Word sənədi brauzerdə göstərilmir — «Yüklə» ilə açın.
          </Typography>
        </Box>
      ) : null}
    </Box>
  );
}
