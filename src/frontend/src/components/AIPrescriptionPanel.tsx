import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, FileText, Printer, Download, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { Treatment } from '../backend';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface AIPrescriptionPanelProps {
  patientName: string;
  diagnosis: string;
  onAddTreatmentPlan: (treatment: Treatment) => void;
}

interface TreatmentTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  exercises: string[];
  intensity: string;
  duration: string;
  frequency: string;
  price: number;
}

const TREATMENT_TEMPLATES: TreatmentTemplate[] = [
  {
    id: 'post-surgery-rehab',
    name: 'Post-Surgery Rehabilitation',
    category: 'Post-Surgery',
    description: 'Comprehensive rehabilitation program for post-surgical recovery',
    exercises: [
      'Gentle range of motion exercises',
      'Progressive resistance training',
      'Balance and proprioception exercises',
      'Functional movement training',
      'Scar tissue mobilization'
    ],
    intensity: 'Low to Moderate (gradually increasing)',
    duration: '8-12 weeks',
    frequency: '3 sessions per week',
    price: 2500
  },
  {
    id: 'chronic-pain-management',
    name: 'Chronic Pain Management',
    category: 'Chronic Pain',
    description: 'Holistic approach to managing chronic pain conditions',
    exercises: [
      'Gentle stretching and flexibility exercises',
      'Core strengthening',
      'Postural correction exercises',
      'Relaxation and breathing techniques',
      'Manual therapy and soft tissue mobilization'
    ],
    intensity: 'Low to Moderate',
    duration: '6-8 weeks (ongoing maintenance)',
    frequency: '2-3 sessions per week',
    price: 1800
  },
  {
    id: 'sports-injury-recovery',
    name: 'Sports Injury Recovery',
    category: 'Sports Injury',
    description: 'Targeted rehabilitation for sports-related injuries',
    exercises: [
      'Sport-specific movement patterns',
      'Plyometric exercises',
      'Agility and coordination drills',
      'Strength and power training',
      'Return-to-sport progression'
    ],
    intensity: 'Moderate to High',
    duration: '4-8 weeks',
    frequency: '3-4 sessions per week',
    price: 2200
  },
  {
    id: 'back-pain-relief',
    name: 'Back Pain Relief Program',
    category: 'Back Pain',
    description: 'Specialized program for lower back pain management',
    exercises: [
      'Core stabilization exercises',
      'Spinal mobility exercises',
      'Hip and hamstring stretching',
      'Postural awareness training',
      'Ergonomic education'
    ],
    intensity: 'Low to Moderate',
    duration: '6 weeks',
    frequency: '2 sessions per week',
    price: 1500
  },
  {
    id: 'neck-shoulder-therapy',
    name: 'Neck & Shoulder Therapy',
    category: 'Neck/Shoulder',
    description: 'Treatment for neck and shoulder pain and stiffness',
    exercises: [
      'Cervical range of motion exercises',
      'Shoulder blade strengthening',
      'Upper trapezius stretching',
      'Postural correction',
      'Manual therapy techniques'
    ],
    intensity: 'Low to Moderate',
    duration: '4-6 weeks',
    frequency: '2 sessions per week',
    price: 1400
  },
  {
    id: 'knee-rehabilitation',
    name: 'Knee Rehabilitation',
    category: 'Knee',
    description: 'Comprehensive knee injury rehabilitation',
    exercises: [
      'Quadriceps strengthening',
      'Hamstring flexibility exercises',
      'Balance and stability training',
      'Gait training',
      'Progressive weight-bearing exercises'
    ],
    intensity: 'Moderate',
    duration: '6-10 weeks',
    frequency: '3 sessions per week',
    price: 2000
  }
];

export default function AIPrescriptionPanel({ patientName, diagnosis, onAddTreatmentPlan }: AIPrescriptionPanelProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [patientCondition, setPatientCondition] = useState('');
  const [generatedPrescription, setGeneratedPrescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAIPrescription = () => {
    setIsGenerating(true);
    
    // Simulate AI generation with a delay
    setTimeout(() => {
      const template = TREATMENT_TEMPLATES.find(t => t.id === selectedTemplate);
      if (!template) {
        toast.error('Please select a treatment template');
        setIsGenerating(false);
        return;
      }

      const prescription = `
        <h2>Physiotherapy Prescription</h2>
        <p><strong>Patient:</strong> ${patientName || 'Not specified'}</p>
        <p><strong>Diagnosis:</strong> ${diagnosis || 'Not specified'}</p>
        <p><strong>Condition Details:</strong> ${patientCondition || 'Not specified'}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        
        <h3>Treatment Plan: ${template.name}</h3>
        <p>${template.description}</p>
        
        <h4>Recommended Exercises:</h4>
        <ul>
          ${template.exercises.map(ex => `<li>${ex}</li>`).join('')}
        </ul>
        
        <h4>Treatment Parameters:</h4>
        <ul>
          <li><strong>Intensity:</strong> ${template.intensity}</li>
          <li><strong>Duration:</strong> ${template.duration}</li>
          <li><strong>Frequency:</strong> ${template.frequency}</li>
        </ul>
        
        <h4>Additional Recommendations:</h4>
        <ul>
          <li>Maintain proper hydration throughout treatment</li>
          <li>Report any unusual pain or discomfort immediately</li>
          <li>Follow home exercise program as prescribed</li>
          <li>Attend all scheduled sessions for optimal results</li>
        </ul>
        
        <p><em>This prescription is AI-assisted and should be reviewed by a licensed physiotherapist before implementation.</em></p>
      `;

      setGeneratedPrescription(prescription);
      setIsGenerating(false);
      toast.success('Prescription generated successfully');
    }, 1500);
  };

  const handleAddTreatmentPlan = () => {
    const template = TREATMENT_TEMPLATES.find(t => t.id === selectedTemplate);
    if (!template) {
      toast.error('Please select a treatment template');
      return;
    }

    const startDate = Date.now();
    const durationWeeks = parseInt(template.duration.split('-')[0]) || 6;
    const endDate = startDate + (durationWeeks * 7 * 24 * 60 * 60 * 1000);

    const treatment: Treatment = {
      type: template.name,
      price: BigInt(template.price),
      date: BigInt(startDate * 1000000),
      notes: generatedPrescription.replace(/<[^>]*>/g, '').substring(0, 500),
      plan: {
        description: template.description,
        startDate: BigInt(startDate * 1000000),
        endDate: BigInt(endDate * 1000000),
      }
    };

    onAddTreatmentPlan(treatment);
    toast.success('Treatment plan added to patient record');
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Prescription - ${patientName}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
              h2 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
              h3 { color: #1e40af; margin-top: 20px; }
              h4 { color: #1e3a8a; margin-top: 15px; }
              ul { line-height: 1.8; }
              p { line-height: 1.6; }
              @media print { body { padding: 20px; } }
            </style>
          </head>
          <body>
            ${generatedPrescription}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleExport = () => {
    const blob = new Blob([generatedPrescription.replace(/<[^>]*>/g, '\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prescription-${patientName.replace(/\s+/g, '-')}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Prescription exported successfully');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Prescription & Treatment Plans
          </CardTitle>
          <CardDescription>
            Generate AI-assisted prescriptions and treatment plans based on patient condition
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template">Select Treatment Template *</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger id="template">
                <SelectValue placeholder="Choose a treatment template..." />
              </SelectTrigger>
              <SelectContent>
                {TREATMENT_TEMPLATES.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} - {template.category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTemplate && (
            <div className="rounded-lg bg-primary/5 p-4 space-y-2">
              <h4 className="font-medium text-primary">Template Details</h4>
              {(() => {
                const template = TREATMENT_TEMPLATES.find(t => t.id === selectedTemplate);
                return template ? (
                  <>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Duration:</span> {template.duration}
                      </div>
                      <div>
                        <span className="font-medium">Frequency:</span> {template.frequency}
                      </div>
                      <div>
                        <span className="font-medium">Intensity:</span> {template.intensity}
                      </div>
                      <div>
                        <span className="font-medium">Price:</span> ${template.price.toLocaleString()}
                      </div>
                    </div>
                  </>
                ) : null;
              })()}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="condition">Patient Condition Details</Label>
            <Textarea
              id="condition"
              placeholder="Describe the patient's specific condition, symptoms, and any relevant medical history..."
              value={patientCondition}
              onChange={(e) => setPatientCondition(e.target.value)}
              rows={4}
            />
          </div>

          <Button
            type="button"
            onClick={generateAIPrescription}
            disabled={!selectedTemplate || isGenerating}
            className="w-full"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {isGenerating ? 'Generating Prescription...' : 'Generate AI Prescription'}
          </Button>
        </CardContent>
      </Card>

      {generatedPrescription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generated Prescription
            </CardTitle>
            <CardDescription>
              Review and customize the prescription before adding to patient record
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border">
              <ReactQuill
                theme="snow"
                value={generatedPrescription}
                onChange={setGeneratedPrescription}
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['clean']
                  ]
                }}
                className="bg-background"
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleAddTreatmentPlan}
                className="flex-1"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add to Treatment Plan
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handlePrint}
              >
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleExport}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
