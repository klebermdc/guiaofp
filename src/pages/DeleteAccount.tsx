import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import logo from '@/assets/logo.png';

const DeleteAccount = () => {
  return (
    <>
      <SEO
        title="Exclusão de Conta — OFP Planejador"
        description="Solicite a exclusão da sua conta e dados pessoais do aplicativo OFP Planejador (Orlando Fast Pass)."
      />
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <Link to="/" aria-label="Voltar para página inicial">
              <img
                src={logo}
                alt="Orlando Fast Pass Planejador"
                className="w-48 h-auto mx-auto"
                loading="eager"
              />
            </Link>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 md:p-10 space-y-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
                Solicitação de Exclusão de Conta
              </h1>
              <p className="text-muted-foreground">
                Aplicativo <strong className="text-foreground">OFP Planejador</strong> — desenvolvido por <strong className="text-foreground">Orlando Fast Pass</strong>
              </p>
            </div>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">
                Como solicitar a exclusão da sua conta
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>
                  Entre em contato pelo nosso WhatsApp:{' '}
                  <a
                    href="https://wa.me/message/TRKS54CVGEGUK1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent font-medium hover:underline"
                  >
                    clique aqui para abrir o chat
                  </a>.
                </li>
                <li>
                  Informe o <strong className="text-foreground">e-mail</strong> cadastrado na sua conta e solicite a exclusão.
                </li>
                <li>
                  Nossa equipe confirmará a sua identidade e processará a solicitação em até <strong className="text-foreground">5 dias úteis</strong>.
                </li>
                <li>
                  Você receberá uma confirmação por e-mail quando a exclusão for concluída.
                </li>
              </ol>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">
                Dados que serão excluídos
              </h2>
              <p className="text-muted-foreground">
                Ao solicitar a exclusão da conta, os seguintes dados serão <strong className="text-foreground">permanentemente removidos</strong>:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Informações de perfil (nome, e-mail, telefone, dados de viagem)</li>
                <li>Preferências de atrações e roteiros salvos</li>
                <li>Planejamentos e itinerários criados</li>
                <li>Contratos e histórico de compras</li>
                <li>Documentos enviados (vouchers, ingressos)</li>
                <li>Avaliações de restaurantes e favoritos</li>
                <li>Configurações de notificações push</li>
                <li>Credenciais de autenticação</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">
                Dados que podem ser retidos temporariamente
              </h2>
              <p className="text-muted-foreground">
                Alguns dados podem ser mantidos por um período limitado conforme exigências legais:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>
                  <strong className="text-foreground">Registros de transações financeiras</strong> — retidos por até 5 anos para cumprimento de obrigações fiscais e contábeis (Lei nº 5.172/1966 — Código Tributário Nacional).
                </li>
                <li>
                  <strong className="text-foreground">Logs de acesso</strong> — retidos por até 6 meses conforme o Marco Civil da Internet (Lei nº 12.965/2014).
                </li>
              </ul>
              <p className="text-muted-foreground text-sm">
                Após os períodos acima, esses dados também serão eliminados de forma permanente.
              </p>
            </section>

            <div className="pt-4 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                Dúvidas? Fale conosco pelo{' '}
                <a
                  href="https://wa.me/message/TRKS54CVGEGUK1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent font-medium hover:underline"
                >
                  WhatsApp
                </a>{' '}
                ou acesse nossa{' '}
                <Link to="/termos-e-privacidade" className="text-accent font-medium hover:underline">
                  Política de Privacidade
                </Link>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeleteAccount;
