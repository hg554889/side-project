import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * PDF 리포트 생성 유틸리티
 */
export class PDFGenerator {

  /**
   * 분석 결과 PDF 리포트 생성
   * @param {Object} analysisData - 분석 결과 데이터
   * @param {string} fileName - 파일명 (기본값: analysis-report)
   */
  static async generateAnalysisReport(analysisData, fileName = 'analysis-report') {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;

      // 한글 폰트 설정 (기본 폰트로 대체)
      pdf.setFont('helvetica');

      let currentY = margin;

      // 헤더
      pdf.setFontSize(24);
      pdf.setTextColor(37, 99, 235); // Primary color
      pdf.text('SkillMap 분석 리포트', margin, currentY);
      currentY += 15;

      // 생성 날짜
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`생성일: ${new Date().toLocaleDateString('ko-KR')}`, margin, currentY);
      currentY += 20;

      // 분석 개요
      pdf.setFontSize(18);
      pdf.setTextColor(0, 0, 0);
      pdf.text('분석 개요', margin, currentY);
      currentY += 10;

      pdf.setFontSize(12);
      pdf.text(`분석 제목: ${analysisData.title || '직무 분석'}`, margin, currentY);
      currentY += 8;
      pdf.text(`분석 설명: ${analysisData.description || '상세 분석 결과'}`, margin, currentY);
      currentY += 8;
      pdf.text(`분석 카테고리: ${analysisData.category || 'IT/개발'}`, margin, currentY);
      currentY += 15;

      // 주요 발견사항
      pdf.setFontSize(18);
      pdf.text('주요 발견사항', margin, currentY);
      currentY += 10;

      if (analysisData.details && Array.isArray(analysisData.details)) {
        pdf.setFontSize(12);
        analysisData.details.forEach((detail, index) => {
          const bulletPoint = `• ${detail}`;
          const lines = pdf.splitTextToSize(bulletPoint, pageWidth - 2 * margin);

          // 페이지 넘김 체크
          if (currentY + (lines.length * 6) > pageHeight - margin) {
            pdf.addPage();
            currentY = margin;
          }

          lines.forEach(line => {
            pdf.text(line, margin, currentY);
            currentY += 6;
          });
          currentY += 2;
        });
      }

      currentY += 10;

      // 스킬 분석 섹션
      pdf.setFontSize(18);
      pdf.text('스킬 요구도 분석', margin, currentY);
      currentY += 10;

      // Mock 스킬 데이터
      const skills = [
        { name: 'JavaScript', percentage: 92 },
        { name: 'React', percentage: 85 },
        { name: 'TypeScript', percentage: 67 },
        { name: 'Node.js', percentage: 54 },
      ];

      pdf.setFontSize(12);
      skills.forEach(skill => {
        // 페이지 넘김 체크
        if (currentY > pageHeight - margin - 20) {
          pdf.addPage();
          currentY = margin;
        }

        pdf.text(`${skill.name}: ${skill.percentage}%`, margin, currentY);

        // 프로그레스 바 그리기
        const barWidth = 100;
        const barHeight = 4;
        const barX = margin + 50;
        const barY = currentY - 3;

        // 배경
        pdf.setFillColor(230, 230, 230);
        pdf.rect(barX, barY, barWidth, barHeight, 'F');

        // 진행률
        pdf.setFillColor(37, 99, 235);
        pdf.rect(barX, barY, (barWidth * skill.percentage / 100), barHeight, 'F');

        currentY += 12;
      });

      currentY += 10;

      // 연봉 정보
      pdf.setFontSize(18);
      pdf.text('예상 연봉 정보', margin, currentY);
      currentY += 10;

      pdf.setFontSize(12);
      pdf.text('신입 평균 연봉: 3,500만원', margin, currentY);
      currentY += 8;
      pdf.text('최소 연봉: 3,000만원', margin, currentY);
      currentY += 8;
      pdf.text('최대 연봉: 4,500만원', margin, currentY);
      currentY += 15;

      // 추천 학습 경로
      pdf.setFontSize(18);
      pdf.text('추천 학습 경로', margin, currentY);
      currentY += 10;

      const learningSteps = [
        '1. JavaScript 기초 강화',
        '2. React 심화 학습',
        '3. TypeScript 도입',
        '4. 포트폴리오 프로젝트',
      ];

      pdf.setFontSize(12);
      learningSteps.forEach(step => {
        pdf.text(`• ${step}`, margin, currentY);
        currentY += 8;
      });

      // 푸터
      const footerY = pageHeight - 15;
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text('SkillMap - AI 기반 커리어 분석 서비스', margin, footerY);
      pdf.text(`Page 1 of ${pdf.internal.getNumberOfPages()}`, pageWidth - margin - 30, footerY);

      // PDF 다운로드
      pdf.save(`${fileName}.pdf`);
      return true;
    } catch (error) {
      console.error('PDF 생성 실패:', error);
      throw new Error('PDF 리포트 생성에 실패했습니다.');
    }
  }

  /**
   * 학습 경로 PDF 리포트 생성
   * @param {Object} learningPath - 학습 경로 데이터
   * @param {string} fileName - 파일명
   */
  static async generateLearningPathReport(learningPath, fileName = 'learning-path') {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;

      let currentY = margin;

      // 헤더
      pdf.setFontSize(24);
      pdf.setTextColor(37, 99, 235);
      pdf.text('학습 경로 가이드', margin, currentY);
      currentY += 15;

      // 경로 제목
      pdf.setFontSize(20);
      pdf.setTextColor(0, 0, 0);
      pdf.text(learningPath.title, margin, currentY);
      currentY += 12;

      // 경로 설명
      pdf.setFontSize(12);
      const descLines = pdf.splitTextToSize(learningPath.description, pageWidth - 2 * margin);
      descLines.forEach(line => {
        pdf.text(line, margin, currentY);
        currentY += 6;
      });
      currentY += 10;

      // 기본 정보
      pdf.setFontSize(14);
      pdf.text('기본 정보', margin, currentY);
      currentY += 8;

      pdf.setFontSize(12);
      pdf.text(`난이도: ${learningPath.difficulty}`, margin, currentY);
      currentY += 6;
      pdf.text(`예상 기간: ${learningPath.duration}`, margin, currentY);
      currentY += 6;
      pdf.text(`총 단계: ${learningPath.steps?.length || 0}단계`, margin, currentY);
      currentY += 12;

      // 사전 요구사항
      if (learningPath.prerequisites && learningPath.prerequisites.length > 0) {
        pdf.setFontSize(14);
        pdf.text('사전 요구사항', margin, currentY);
        currentY += 8;

        pdf.setFontSize(12);
        learningPath.prerequisites.forEach(req => {
          pdf.text(`• ${req}`, margin, currentY);
          currentY += 6;
        });
        currentY += 8;
      }

      // 학습 단계
      if (learningPath.steps && learningPath.steps.length > 0) {
        pdf.setFontSize(14);
        pdf.text('학습 단계', margin, currentY);
        currentY += 8;

        learningPath.steps.forEach((step, index) => {
          // 페이지 넘김 체크
          if (currentY > pageHeight - margin - 30) {
            pdf.addPage();
            currentY = margin;
          }

          pdf.setFontSize(13);
          pdf.setTextColor(37, 99, 235);
          pdf.text(`Phase ${step.phase}: ${step.title}`, margin, currentY);
          currentY += 8;

          pdf.setFontSize(11);
          pdf.setTextColor(0, 0, 0);
          pdf.text(`기간: ${step.duration}`, margin + 10, currentY);
          currentY += 6;

          pdf.text('주요 주제:', margin + 10, currentY);
          currentY += 5;
          step.topics?.forEach(topic => {
            pdf.text(`  - ${topic}`, margin + 15, currentY);
            currentY += 5;
          });

          pdf.text('추천 자료:', margin + 10, currentY);
          currentY += 5;
          step.resources?.forEach(resource => {
            pdf.text(`  - ${resource}`, margin + 15, currentY);
            currentY += 5;
          });

          currentY += 8;
        });
      }

      // 학습 결과
      if (learningPath.outcomes && learningPath.outcomes.length > 0) {
        if (currentY > pageHeight - margin - 40) {
          pdf.addPage();
          currentY = margin;
        }

        pdf.setFontSize(14);
        pdf.text('기대 학습 결과', margin, currentY);
        currentY += 8;

        pdf.setFontSize(12);
        learningPath.outcomes.forEach(outcome => {
          pdf.text(`• ${outcome}`, margin, currentY);
          currentY += 6;
        });
      }

      // 푸터
      const footerY = pageHeight - 15;
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text('SkillMap - AI 기반 커리어 분석 서비스', margin, footerY);
      pdf.text(`Page 1 of ${pdf.internal.getNumberOfPages()}`, pageWidth - margin - 30, footerY);

      // PDF 다운로드
      pdf.save(`${fileName}.pdf`);
      return true;
    } catch (error) {
      console.error('PDF 생성 실패:', error);
      throw new Error('학습 경로 PDF 생성에 실패했습니다.');
    }
  }

  /**
   * HTML 요소를 PDF로 변환
   * @param {string} elementId - HTML 요소 ID
   * @param {string} fileName - 파일명
   * @param {Object} options - 옵션
   */
  static async generateFromHTML(elementId, fileName = 'report', options = {}) {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error('HTML 요소를 찾을 수 없습니다.');
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        ...options
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // 첫 페이지
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // 추가 페이지들
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${fileName}.pdf`);
      return true;
    } catch (error) {
      console.error('HTML to PDF 변환 실패:', error);
      throw new Error('HTML을 PDF로 변환하는데 실패했습니다.');
    }
  }
}

export default PDFGenerator;