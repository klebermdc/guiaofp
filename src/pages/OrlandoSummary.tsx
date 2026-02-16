import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { SEO } from "@/components/SEO";
import { orlandoSections } from "@/data/orlandoSummaryData";
import heroCastle from "@/assets/orlando-summary/hero-castle.jpg";

const sectionDelay = (i: number) => 0.15 + i * 0.1;

const OrlandoSummary = () => {
  return (
    <>
      <SEO
        title="Resumo de Orlando | Orlando Fast Pass"
        description="Tudo que você precisa saber sobre Orlando: parques, compras, hotéis, alimentação e transporte em um guia completo."
      />

      <div className="min-h-screen bg-[hsl(220_40%_8%)] text-white">
        {/* ── Hero ── */}
        <section className="relative flex items-center justify-center min-h-[70vh] overflow-hidden">
          {/* background image */}
          <img
            src={heroCastle}
            alt="Castelo da Disney ao entardecer em Orlando"
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
          {/* overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220_40%_8%/0.45)] via-[hsl(220_40%_8%/0.6)] to-[hsl(220_40%_8%)]" />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative z-10 max-w-3xl mx-auto px-4 text-center"
          >
            <span className="inline-flex items-center gap-1.5 text-[hsl(82_72%_55%)] font-semibold text-sm uppercase tracking-widest mb-4">
              <Sparkles className="w-4 h-4" /> Guia Completo
            </span>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold uppercase leading-tight tracking-tight">
              Orlando:{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, hsl(82 72% 55%), hsl(82 72% 75%))",
                }}
              >
                Seu Guia
              </span>{" "}
              para uma Viagem Inesquecível
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Orlando é a capital mundial da diversão, um destino que transcende
              idades e oferece experiências inesquecíveis para todos.
            </p>
          </motion.div>
        </section>

        {/* ── Sections ── */}
        <section className="max-w-5xl mx-auto px-4 py-16 space-y-12">
          {orlandoSections.map((section, sIdx) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: sectionDelay(sIdx) }}
              className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm overflow-hidden"
            >
              {/* Section header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-xl"
                  style={{ backgroundColor: `${section.color}` }}
                >
                  <section.icon className="w-5 h-5 text-[hsl(220_40%_8%)]" />
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-wide">
                  {section.title}
                </h2>
              </div>

              {/* Items */}
              <ul className="divide-y divide-white/5">
                {section.items.map((item, iIdx) => (
                  <motion.li
                    key={iIdx}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: sectionDelay(sIdx) + iIdx * 0.07 }}
                    className="px-5 py-4 flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 group hover:bg-white/[0.03] transition-colors"
                  >
                    <span
                      className="shrink-0 w-1.5 h-1.5 rounded-full mt-2 hidden sm:block"
                      style={{ backgroundColor: section.color }}
                    />
                    <div>
                      <span className="font-semibold text-white/95">{item.title}:</span>{" "}
                      <span className="text-white/70">{item.description}</span>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </section>

        {/* ── Bottom CTA area ── */}
        <section className="pb-20 text-center px-4">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-white/50 text-sm max-w-md mx-auto"
          >
            Explore cada detalhe com o Orlando Fast Pass e transforme sua viagem
            em uma experiência perfeita. ✨
          </motion.p>
        </section>
      </div>
    </>
  );
};

export default OrlandoSummary;
