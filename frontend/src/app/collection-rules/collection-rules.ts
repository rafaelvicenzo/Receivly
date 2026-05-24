import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CollectionRuleService, CollectionRule, RuleStep } from '../services/collection-rule';
import { CollectionRulesSkeletonComponent } from './collection-rules-skeleton/collection-rules-skeleton';

@Component({
  selector: 'app-collection-rules',
  standalone: true,
  imports: [CommonModule, FormsModule, CollectionRulesSkeletonComponent],
  templateUrl: './collection-rules.html',
  styleUrl: './collection-rules.scss'
})
export class CollectionRules implements OnInit {
  rules: CollectionRule[] = [];
  isLoading = true;
  showModal = false;
  editingRule: CollectionRule | null = null;
  editingStep: RuleStep | null = null;
  showStepModal = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private ruleService: CollectionRuleService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadRules();
  }

  loadRules(): void {
    this.isLoading = true;
    this.ruleService.getAll().subscribe({
      next: (data) => {
        this.rules = data;
        if (this.rules.length === 0) {
          this.ruleService.getDefault().subscribe({
            next: (defaultRule) => {
              this.rules = [defaultRule];
              this.isLoading = false;
              this.cdr.detectChanges();
            }
          });
        } else {
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      },
      error: () => { this.isLoading = false; }
    });
  }

  openRule(rule: CollectionRule): void {
    this.editingRule = JSON.parse(JSON.stringify(rule));
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingRule = null;
  }

  saveRule(): void {
    if (!this.editingRule?.id) return;
    this.ruleService.update(this.editingRule.id, this.editingRule).subscribe({
      next: () => {
        this.successMessage = 'Régua salva com sucesso!';
        this.loadRules();
        setTimeout(() => {
          this.closeModal();
          this.successMessage = '';
        }, 1000);
      },
      error: () => this.errorMessage = 'Erro ao salvar régua.'
    });
  }

  toggleRule(rule: CollectionRule): void {
    if (!rule.id) return;
    this.ruleService.update(rule.id, { enabled: !rule.enabled }).subscribe({
      next: () => this.loadRules()
    });
  }

  toggleStep(step: RuleStep): void {
    step.enabled = !step.enabled;
  }

  openStepModal(step: RuleStep): void {
    this.editingStep = JSON.parse(JSON.stringify(step));
    this.showStepModal = true;
  }

  closeStepModal(): void {
    this.showStepModal = false;
    this.editingStep = null;
  }

  saveStep(): void {
    if (!this.editingRule || !this.editingStep) return;
    const index = this.editingRule.steps.findIndex(s => s.id === this.editingStep!.id);
    if (index !== -1) {
      this.editingRule.steps[index] = { ...this.editingStep };
    }
    this.closeStepModal();
  }

  addStep(): void {
    if (!this.editingRule) return;
    const newStep: RuleStep = {
      id: Date.now(),
      days: 1,
      timing: 'after',
      channel: 'whatsapp',
      enabled: true,
      message: 'Olá {nome}, sua fatura de *R$ {valor}* está pendente.'
    };
    this.editingRule.steps.push(newStep);
    this.openStepModal(newStep);
  }

  removeStep(step: RuleStep): void {
    if (!this.editingRule) return;
    this.editingRule.steps = this.editingRule.steps.filter(s => s.id !== step.id);
  }

  getTimingLabel(timing: string, days: number): string {
    if (timing === 'before') return `${days} dias antes`;
    if (timing === 'due') return 'No dia do vencimento';
    return `${days} ${days === 1 ? 'dia' : 'dias'} após`;
  }

  getChannelIcon(channel: string): string {
    const map: Record<string, string> = {
      whatsapp: '💬',
      email: '📧',
      sms: '📱'
    };
    return map[channel] || '💬';
  }
}