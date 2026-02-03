import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, Lock, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import logo from '@/assets/logo.png';

// Current version of the terms document
export const TERMS_VERSION = '1.0';

export default function TermsAndPrivacy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Guia Orlando em Família" className="h-10" />
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Page Title */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Shield className="w-4 h-4" />
            Transparência e Segurança
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Termos e Políticas
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Sua confiança é nossa prioridade. Leia atentamente nossos termos de uso, 
            política de privacidade e política de cancelamento.
          </p>
          <p className="text-xs text-muted-foreground">
            Versão do documento: {TERMS_VERSION} | Última atualização: Janeiro de 2025
          </p>
        </div>

        {/* Quick Navigation */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3 justify-center">
              <a href="#termos-de-uso" className="text-sm text-primary hover:underline">
                Termos de Uso
              </a>
              <span className="text-muted-foreground">•</span>
              <a href="#politica-privacidade" className="text-sm text-primary hover:underline">
                Política de Privacidade
              </a>
              <span className="text-muted-foreground">•</span>
              <a href="#politica-cancelamento" className="text-sm text-primary hover:underline">
                Política de Cancelamento
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Terms of Use */}
        <Card id="termos-de-uso">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              Termos de Uso
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-foreground">1. Aceitação dos Termos</h3>
              <p className="text-muted-foreground leading-relaxed">
                Ao acessar e utilizar os serviços do Guia Orlando em Família ("Plataforma"), você concorda 
                integralmente com estes Termos de Uso. Caso não concorde com alguma condição, 
                recomendamos que não utilize nossos serviços.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">2. Descrição dos Serviços</h3>
              <p className="text-muted-foreground leading-relaxed">
                A Plataforma oferece serviços de planejamento de viagem para Orlando, incluindo:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Roteiros personalizados para parques temáticos</li>
                <li>Dicas e orientações de viagem</li>
                <li>Mapas interativos dos parques</li>
                <li>Suporte via WhatsApp (para planos premium)</li>
                <li>Guia humano dedicado (para planos premium)</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">3. Cadastro e Conta</h3>
              <p className="text-muted-foreground leading-relaxed">
                Para utilizar nossos serviços, você deve criar uma conta fornecendo informações 
                verdadeiras e atualizadas. Você é responsável por manter a confidencialidade 
                de suas credenciais de acesso.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">4. Uso Adequado</h3>
              <p className="text-muted-foreground leading-relaxed">
                Você concorda em utilizar a Plataforma de forma ética e legal, não sendo 
                permitido:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Compartilhar suas credenciais de acesso com terceiros</li>
                <li>Copiar ou redistribuir conteúdo sem autorização</li>
                <li>Tentar burlar os sistemas de segurança da Plataforma</li>
                <li>Utilizar a Plataforma para fins comerciais não autorizados</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">5. Propriedade Intelectual</h3>
              <p className="text-muted-foreground leading-relaxed">
                Todo o conteúdo disponível na Plataforma, incluindo textos, imagens, logotipos, 
                roteiros e materiais exclusivos, é de propriedade do Guia Orlando em Família 
                ou de seus parceiros licenciados, sendo protegido por leis de direitos autorais.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">6. Limitação de Responsabilidade</h3>
              <p className="text-muted-foreground leading-relaxed">
                A Plataforma não se responsabiliza por alterações de horários, preços ou 
                funcionamento dos parques temáticos, que são definidos pelas respectivas 
                operadoras (Disney, Universal, etc.). Nosso serviço é de consultoria e 
                planejamento, não substituindo informações oficiais dos parques.
              </p>
            </section>
          </CardContent>
        </Card>

        <Separator />

        {/* Privacy Policy */}
        <Card id="politica-privacidade">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Lock className="w-5 h-5 text-success" />
              </div>
              Política de Privacidade
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-foreground">1. Dados Coletados</h3>
              <p className="text-muted-foreground leading-relaxed">
                Coletamos os seguintes dados para fornecer nossos serviços:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li><strong>Dados de identificação:</strong> nome, e-mail, telefone, CPF</li>
                <li><strong>Dados de viagem:</strong> datas, hotel, tamanho do grupo, preferências</li>
                <li><strong>Dados de pagamento:</strong> processados de forma segura via Asaas</li>
                <li><strong>Dados de uso:</strong> interações com a plataforma, preferências salvas</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">2. Finalidade do Tratamento</h3>
              <p className="text-muted-foreground leading-relaxed">
                Seus dados são utilizados exclusivamente para:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Personalizar seu roteiro de viagem</li>
                <li>Processar pagamentos de forma segura</li>
                <li>Entrar em contato para suporte e orientações</li>
                <li>Enviar comunicações relevantes sobre sua viagem</li>
                <li>Melhorar nossos serviços com base em feedback</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">3. Compartilhamento de Dados</h3>
              <p className="text-muted-foreground leading-relaxed">
                Seus dados NÃO são vendidos ou compartilhados com terceiros para fins de 
                marketing. Compartilhamos dados apenas com:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li><strong>Asaas:</strong> processamento seguro de pagamentos</li>
                <li><strong>Provedores de infraestrutura:</strong> hospedagem e segurança</li>
                <li><strong>Guias designados:</strong> para clientes do plano premium</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">4. Segurança dos Dados</h3>
              <p className="text-muted-foreground leading-relaxed">
                Implementamos medidas técnicas e organizacionais para proteger seus dados, 
                incluindo criptografia SSL/TLS, controle de acesso baseado em funções (RBAC), 
                e políticas de Row Level Security (RLS) no banco de dados.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">5. Seus Direitos (LGPD)</h3>
              <p className="text-muted-foreground leading-relaxed">
                De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incompletos ou desatualizados</li>
                <li>Solicitar a exclusão de seus dados</li>
                <li>Revogar consentimentos previamente dados</li>
                <li>Portabilidade dos dados</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-2">
                Para exercer seus direitos, entre em contato conosco pelo e-mail de suporte.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">6. Cookies e Tecnologias</h3>
              <p className="text-muted-foreground leading-relaxed">
                Utilizamos cookies e tecnologias similares para melhorar sua experiência, 
                lembrar suas preferências e analisar o uso da plataforma. Você pode 
                gerenciar as configurações de cookies em seu navegador.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">7. Retenção de Dados</h3>
              <p className="text-muted-foreground leading-relaxed">
                Mantemos seus dados pelo tempo necessário para fornecer nossos serviços e 
                cumprir obrigações legais. Dados de transações são mantidos por 5 anos 
                para fins fiscais e de auditoria.
              </p>
            </section>
          </CardContent>
        </Card>

        <Separator />

        {/* Cancellation Policy */}
        <Card id="politica-cancelamento">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <CreditCard className="w-5 h-5 text-warning" />
              </div>
              Política de Cancelamento e Reembolso
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-foreground">1. Garantia de Satisfação</h3>
              <p className="text-muted-foreground leading-relaxed">
                Oferecemos uma garantia de satisfação de <strong>7 dias</strong> a partir da 
                data de ativação do seu acesso. Se você não estiver satisfeito com nossos 
                serviços, pode solicitar o reembolso integral dentro deste período.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">2. Como Solicitar Reembolso</h3>
              <p className="text-muted-foreground leading-relaxed">
                Para solicitar o reembolso, entre em contato conosco informando:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>E-mail cadastrado na plataforma</li>
                <li>Motivo do cancelamento (opcional, mas nos ajuda a melhorar)</li>
                <li>Dados bancários para devolução (PIX ou transferência)</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">3. Prazo de Processamento</h3>
              <p className="text-muted-foreground leading-relaxed">
                O reembolso será processado em até <strong>7 dias úteis</strong> após a 
                confirmação da solicitação. O valor será devolvido pelo mesmo método de 
                pagamento utilizado na compra, ou via PIX conforme solicitado.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">4. Exceções</h3>
              <p className="text-muted-foreground leading-relaxed">
                O reembolso NÃO se aplica nos seguintes casos:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Solicitações feitas após o período de 7 dias</li>
                <li>Uso significativo dos serviços (mais de 50% do conteúdo acessado)</li>
                <li>Violação dos termos de uso</li>
                <li>Compartilhamento indevido de credenciais</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">5. Cancelamento pelo Cliente</h3>
              <p className="text-muted-foreground leading-relaxed">
                Você pode cancelar seu acesso a qualquer momento. Se o cancelamento for 
                solicitado após o período de garantia, o acesso permanecerá ativo até o 
                final do período contratado, sem direito a reembolso proporcional.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">6. Alteração de Plano</h3>
              <p className="text-muted-foreground leading-relaxed">
                É possível fazer upgrade do seu plano a qualquer momento. O valor já pago 
                será abatido do novo plano. Não é possível fazer downgrade com reembolso 
                da diferença.
              </p>
            </section>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-6 text-center space-y-4">
            <h3 className="text-xl font-semibold text-foreground">
              Dúvidas sobre nossos termos?
            </h3>
            <p className="text-muted-foreground">
              Entre em contato conosco para esclarecimentos adicionais.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/contato">
                <Button variant="outline">
                  Fale Conosco
                </Button>
              </Link>
              <Link to="/">
                <Button className="gradient-primary text-primary-foreground">
                  Voltar ao Início
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Guia Orlando em Família. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
