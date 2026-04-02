import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PlannerItem {
  id: string;
  date: string;
  time_slot: string;
  item_name: string;
  category: string;
  icon?: string;
  start_time?: string;
  duration?: number;
  completed?: boolean;
  notes?: string;
}

interface Planner {
  title: string;
  start_date: string;
  end_date: string;
  total_days: number;
}

const TIME_SLOT_LABELS: Record<string, string> = {
  morning: '☀️ Manhã',
  afternoon: '🌤️ Tarde',
  evening: '🌙 Noite',
  night: '🌃 Madrugada',
};

const TIME_SLOT_ORDER = ['morning', 'afternoon', 'evening', 'night'];

const CATEGORY_EMOJIS: Record<string, string> = {
  disney: '🏰',
  universal: '⚡',
  seaworld: '🐬',
  restaurant: '🍽️',
  restaurante: '🍽️',
  shopping: '🛍️',
  outlet: '🛍️',
  mall: '🏬',
  supermarket: '🛒',
  activity: '🌴',
  atividade: '🌴',
  hotel: '🏨',
  other: '📍',
};

export const exportPlannerToPDF = (planner: Planner, items: PlannerItem[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Title
  doc.setFontSize(20);
  doc.setTextColor(30, 64, 175); // Primary blue
  doc.text(planner.title, pageWidth / 2, 20, { align: 'center' });
  
  // Dates subtitle
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  const dateRange = `${format(new Date(planner.start_date), 'dd/MM/yyyy')} - ${format(new Date(planner.end_date), 'dd/MM/yyyy')} (${planner.total_days} dias)`;
  doc.text(dateRange, pageWidth / 2, 28, { align: 'center' });
  
  // Stats
  doc.setFontSize(10);
  doc.text(`Total de atividades: ${items.length}`, pageWidth / 2, 35, { align: 'center' });
  
  // Group items by date
  const groupedByDate = items.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {} as Record<string, PlannerItem[]>);
  
  // Sort dates
  const sortedDates = Object.keys(groupedByDate).sort();
  
  let yPosition = 45;
  
  sortedDates.forEach((date, dayIndex) => {
    const dayItems = groupedByDate[date];
    
    // Sort items by time slot
    dayItems.sort((a, b) => {
      const orderA = TIME_SLOT_ORDER.indexOf(a.time_slot || 'morning');
      const orderB = TIME_SLOT_ORDER.indexOf(b.time_slot || 'morning');
      return orderA - orderB;
    });
    
    // Group by time slot for this day
    const groupedBySlot = dayItems.reduce((acc, item) => {
      const slot = item.time_slot || 'morning';
      if (!acc[slot]) acc[slot] = [];
      acc[slot].push(item);
      return acc;
    }, {} as Record<string, PlannerItem[]>);
    
    // Check if we need a new page
    const estimatedHeight = 15 + Object.keys(groupedBySlot).length * 8 + dayItems.length * 8;
    if (yPosition + estimatedHeight > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Day header
    const dayNumber = dayIndex + 1;
    const dayLabel = format(new Date(date), 'EEEE, dd/MM', { locale: ptBR });
    
    doc.setFontSize(14);
    doc.setTextColor(30, 64, 175);
    doc.text(`Dia ${dayNumber} - ${dayLabel}`, 14, yPosition);
    yPosition += 8;
    
    // Build table data for this day
    const tableData: string[][] = [];
    
    TIME_SLOT_ORDER.forEach(slot => {
      const slotItems = groupedBySlot[slot];
      if (!slotItems || slotItems.length === 0) return;
      
      slotItems.forEach((item, idx) => {
        const categoryEmoji = CATEGORY_EMOJIS[item.category?.toLowerCase()] || item.icon || '📍';
        const statusIcon = item.completed ? '✓' : '';
        const timeInfo = item.start_time ? `${item.start_time}` : '';
        const durationInfo = item.duration ? `(${item.duration}min)` : '';
        
        tableData.push([
          idx === 0 ? TIME_SLOT_LABELS[slot] || slot : '',
          `${categoryEmoji} ${item.item_name}`,
          `${timeInfo} ${durationInfo}`.trim(),
          statusIcon,
        ]);
      });
    });
    
    if (tableData.length > 0) {
      autoTable(doc, {
        startY: yPosition,
        head: [['Período', 'Atividade', 'Horário', '']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [30, 64, 175],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 9,
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: 3,
        },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 35 },
          3: { cellWidth: 15, halign: 'center' },
        },
        margin: { left: 14, right: 14 },
        didDrawPage: () => {
          // Reset yPosition for new pages
        },
      });
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }
  });
  
  // Footer with generation date
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm')} | Guia Orlando Mágico`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth - 14,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'right' }
    );
  }
  
  // Download
  const fileName = `roteiro-orlando-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
  
  return fileName;
};
