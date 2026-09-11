import React from 'react';
import { Tool } from '../types';
import { AgeCalculator } from './AgeCalculator';
import { WordCounter } from './WordCounter';
import { CharacterCounter } from './CharacterCounter';
import { CaseConverter } from './CaseConverter';
import { RemoveExtraSpaces } from './RemoveExtraSpaces';
import { TextSorter } from './TextSorter';
import { DuplicateLineRemover } from './DuplicateLineRemover';
import { TextReverser } from './TextReverser';
import { PasswordGenerator } from './PasswordGenerator';
import { JsonFormatter } from './JsonFormatter';
import { JsonValidator } from './JsonValidator';
import { QrCodeGenerator } from './QrCodeGenerator';
import { GpaCalculator } from './GpaCalculator';
import { CgpaCalculator } from './CgpaCalculator';
import { LoanCalculator } from './LoanCalculator';
import { ProfitMarginCalculator } from './ProfitMarginCalculator';
import { DiscountCalculator } from './DiscountCalculator';
import { CurrencyConverter } from './CurrencyConverter';
import { PercentageCalculator } from './PercentageCalculator';
import { UuidGenerator } from './UuidGenerator';
import { TimestampConverter } from './TimestampConverter';
import { ColorPicker } from './ColorPicker';
import { Base64Tool } from './Base64Tool';
import { ImageCompressor } from './ImageCompressor';
import { ImageResizer } from './ImageResizer';
import { ImageCropper } from './ImageCropper';
import { ImageFormatConverter } from './ImageFormatConverter';
import { ImageToBase64 } from './ImageToBase64';
import { ImageMetadataViewer } from './ImageMetadataViewer';
import { UrlEncoderDecoder } from './UrlEncoderDecoder';
import { HashGenerator } from './HashGenerator';
import { RegexTester } from './RegexTester';
import { StudyTimer } from './StudyTimer';
import { AttendanceCalculator } from './AttendanceCalculator';
import { GradeCalculator } from './GradeCalculator';
import { BarcodeGenerator } from './BarcodeGenerator';
import { RandomNumberGenerator } from './RandomNumberGenerator';
import { UnitConverter } from './UnitConverter';
import { StopwatchTimer } from './StopwatchTimer';
import { GenericToolPlaceholder } from './GenericToolPlaceholder';

interface ToolRendererProps {
  tool: Tool;
}

export const ToolRenderer: React.FC<ToolRendererProps> = ({ tool }) => {
  switch (tool.slug) {
    // Calculators
    case 'age-calculator':
      return <AgeCalculator />;
    case 'percentage-calculator':
      return <PercentageCalculator />;
    case 'gpa-calculator':
      return <GpaCalculator />;
    case 'cgpa-calculator':
      return <CgpaCalculator />;
    case 'loan-calculator':
    case 'emi-loan-calculator':
      return <LoanCalculator />;
    case 'profit-margin-calculator':
      return <ProfitMarginCalculator />;
    case 'discount-calculator':
      return <DiscountCalculator />;
    case 'currency-converter':
      return <CurrencyConverter />;

    // Text Tools
    case 'word-counter':
      return <WordCounter />;
    case 'character-counter':
      return <CharacterCounter />;
    case 'case-converter':
      return <CaseConverter />;
    case 'remove-extra-spaces':
      return <RemoveExtraSpaces />;
    case 'text-sorter':
      return <TextSorter />;
    case 'duplicate-line-remover':
      return <DuplicateLineRemover />;
    case 'text-reverser':
      return <TextReverser />;
    case 'password-generator':
      return <PasswordGenerator />;

    // Developer & Daily Tools
    case 'json-formatter':
      return <JsonFormatter />;
    case 'json-validator':
      return <JsonValidator />;
    case 'base64-encoder-decoder':
      return <Base64Tool />;
    case 'url-encoder-decoder':
      return <UrlEncoderDecoder />;
    case 'uuid-generator':
      return <UuidGenerator />;
    case 'timestamp-converter':
      return <TimestampConverter />;
    case 'hash-generator':
      return <HashGenerator />;
    case 'regex-tester':
      return <RegexTester />;
    case 'qr-code-generator':
      return <QrCodeGenerator />;
    case 'color-picker':
      return <ColorPicker />;

    // Image Tools
    case 'image-compressor':
      return <ImageCompressor />;
    case 'image-resizer':
      return <ImageResizer />;
    case 'image-cropper':
      return <ImageCropper />;
    case 'image-format-converter':
      return <ImageFormatConverter />;
    case 'image-to-base64':
      return <ImageToBase64 />;
    case 'image-metadata-viewer':
      return <ImageMetadataViewer />;

    // Student Tools
    case 'study-timer':
      return <StudyTimer />;
    case 'attendance-calculator':
      return <AttendanceCalculator />;
    case 'grade-calculator':
      return <GradeCalculator />;

    // Daily Utilities
    case 'barcode-generator':
      return <BarcodeGenerator />;
    case 'random-number-generator':
      return <RandomNumberGenerator />;
    case 'unit-converter':
      return <UnitConverter />;
    case 'stopwatch-timer':
      return <StopwatchTimer />;

    default:
      return <GenericToolPlaceholder tool={tool} />;
  }
};
