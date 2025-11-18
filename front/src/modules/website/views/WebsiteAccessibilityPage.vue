<script setup lang="ts">
import { ref } from "vue";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-vue-next";

const url = ref("");
const viewState = ref("form");
const loading = ref(false);
const error = ref(false);
const resultAnalysis = ref({
  details: [
    {
      title: "",
      score: 0,
      maxScore: 0,
      description: "",
    },
  ],
  total: 0,
});
const config = ref({
  rating: "",
  color: "",
  bgColor: "",
  icon: "",
  description: "",
});

const titleScore = Math.random() * 1 + 2;
const imageScore = Math.random() * 0.5 + 3.3;
const formScore = Math.random() * 1 + 2;
const contrastScore = Math.random() * 0.8 + 2;

const onSubmit = () => {
  loading.value = true;
  viewState.value = "loading";
  setTimeout(() => {
    loading.value = false;
    error.value = false;
    viewState.value = "result";
    resultAnalysis.value.total = 3.5;

    resultAnalysis.value.details = [
      {
        title: "Títulos da Página",
        score: titleScore,
        maxScore: 3,
        description:
          titleScore >= 2.8
            ? "Isto é a 'capa do livro' da sua página. A sua está perfeita! O Google e os visitantes sabem exatamente sobre o que ela fala antes mesmo de entrar."
            : "Isto é a 'capa do livro' da sua página. O título está bom, mas pode ser melhorado para que visitantes e o Google entendam melhor sobre o que sua página fala.",
      },
      {
        title: "Descrição das Imagens",
        score: imageScore,
        maxScore: 4,
        description:
          imageScore >= 3.5
            ? "Isto é a 'descrição das fotos' para quem não pode vê-las. Quase todas as suas imagens têm essa descrição, o que é ótimo para acessibilidade e para o Google entender suas imagens. Perdemos uns pontinhos por uma imagem que ficou sem."
            : "Isto é a 'descrição das fotos' para quem não pode vê-las. Algumas imagens não têm descrição, o que dificulta o acesso para pessoas com deficiência visual e para o Google entender o conteúdo.",
      },
      {
        title: "Etiquetas dos Formulários",
        score: formScore,
        maxScore: 3,
        description:
          formScore >= 2.8
            ? "Isto é a 'etiqueta dos campos' em um formulário. Todos os seus campos (como 'nome', 'email') estão bem identificados. Excelente para usabilidade."
            : "Isto é a 'etiqueta dos campos' em um formulário. Alguns campos não estão bem identificados, o que pode confundir os visitantes na hora de preencher.",
      },
      {
        title: "Contraste de Cores",
        score: contrastScore,
        maxScore: 3,
        description:
          contrastScore >= 2.5
            ? "Isto é a 'visibilidade do texto' na tela. As cores do seu site têm bom contraste, facilitando a leitura para todos, incluindo pessoas com baixa visão."
            : "Isto é a 'visibilidade do texto' na tela. Algumas áreas do seu site têm cores muito parecidas entre texto e fundo, dificultando a leitura, especialmente para pessoas com baixa visão.",
      },
    ];
    config.value = getRatingConfig(resultAnalysis.value.total);
    console.log(config.value);
  }, 20);
};

function resetForm() {
  url.value = "";
  viewState.value = "form";
  loading.value = false;
  error.value = false;
  resultAnalysis.value = {
    total: 0,
    details: [
      {
        title: "",
        score: 0,
        maxScore: 0,
        description: "",
      },
    ],
  };
}

const getRatingConfig = (score: number) => {
  if (score >= 9) {
    return {
      rating: "Excelente",
      color: "text-green-600",
      bgColor: "bg-green-50",
      iconColor: "green-600",
      icon: "CheckCircle2",
      description:
        "Seu site está em ótima conformidade com as diretrizes de acessibilidade WCAG.",
    };
  } else if (score >= 7) {
    return {
      rating: "Bom",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      icon: "AlertCircle",
      description:
        "Seu site está bem, mas algumas melhorias podem torná-lo ainda mais acessível.",
    };
  } else if (score >= 5) {
    return {
      rating: "Necessita Melhorias",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      icon: "AlertTriangle",
      description:
        "Seu site precisa de melhorias significativas para atender aos padrões de acessibilidade.",
    };
  } else {
    return {
      rating: "Crítico",
      color: "text-red-600",
      bgColor: "bg-red-50",
      icon: "XCircle",
      description:
        "Seu site apresenta problemas graves de acessibilidade que precisam ser corrigidos urgentemente.",
    };
  }
};

const getScoreBadgeVariant = (
  score: number,
  maxScore: number
): "default" | "secondary" => {
  const percentage = (score / maxScore) * 100;
  return percentage >= 75 ? "default" : "secondary";
};
</script>

<template>
  <div class="container flex flex-col justify-center align-middle mx-auto px-4">
    <div v-if="viewState === 'form'" class="w-full max-w-2xl mx-auto">
      <Card class="bg-neutral-50 shadow-none border my-4">
        <CardContent class="flex flex-col items-center justify-center">
          <h1 class="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
            Valide a acessibilidade do seu site aqui
          </h1>

          <form @submit.prevent="onSubmit">
            <label for="site-url">Digite a URL do site</label>
            <Input
              id="site-url"
              v-model="url"
              placeholder="ex: https://exemplo.com.br"
              aria-label="URL do site para análise"
              type="url"
              class="w-full bg-white border border-gray-300 rounded-md px-4 py-3 text-base placeholder:text-gray-500 text-gray-900 mt-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />

            <Button
              :disabled="!url"
              type="submit"
              class="w-full bg-blue-600 hover:bg-blue-700 hover:cursor-pointer text-white py-3 rounded-md text-lg font-semibold mt-4"
              >Analisar</Button
            >
          </form>
        </CardContent>
      </Card>
    </div>

    <div v-if="loading" class="w-full max-w-3xl mx-auto">
      <Card class="w-auto bg-neutral-50 shadow-none border my-4">
        <CardContent class="flex flex-col items-center justify-center">
          <Spinner size="32" class="text-blue-600 animate-spin" />
          <p class="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
            Carregando resultados...
          </p>
          <p class="text md:text-lg text-muted-foreground">
            Analisando site {{ url }}
          </p>
        </CardContent>
      </Card>
    </div>

    <div
      v-if="viewState === 'result'"
      class="w-full max-w-3xl mx-auto overflow-y-auto max-h-[80vh]"
    >
      <Card class="w-auto bg-neutral-50 shadow-none border mb-6">
        <CardContent
          class="flex flex-col items-center justify-center p-6 sm:p-8"
        >
          <div class="flex flex-col items-center justify-center space-y-6">
            <div
              :class="`flex h-36 w-36 items-center justify-center rounded-full ${config.bgColor}`"
            >
              <div class="text-center">
                <div class="flex items-baseline justify-center gap-1 mb-2">
                  <span :class="`text-5xl font-bold ${config.color}`">
                    {{ resultAnalysis.total }}
                  </span>
                  <span :class="`text-2xl font-bold ${config.color}`">/10</span>
                </div>
              </div>
            </div>

            <div class="text-center space-y-2">
              <div class="flex items-center justify-center gap-2">
                <CheckCircle2
                  v-if="config.icon === 'CheckCircle2'"
                  color="green"
                  aria-hidden="true"
                />
                <AlertCircle
                  v-if="config.icon === 'AlertCircle'"
                  color="blue"
                  aria-hidden="true"
                />
                <AlertTriangle
                  v-if="config.icon === 'AlertTriangle'"
                  color="orange"
                  aria-hidden="true"
                />
                <XCircle
                  v-if="config.icon === 'XCircle'"
                  color="red"
                  aria-hidden="true"
                />

                <h2 class="text-2xl font-bold" :class="config.color">
                  {{ config.rating }}
                </h2>
              </div>
              <p class="text-md text-muted-foreground max-w-md">
                {{ config.description }}
              </p>
            </div>

            <Badge variant="secondary" class="text-xs">{{ url }}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card class="w-full bg-neutral-50 shadow-none border mb-6">
        <CardHeader>
          <CardTitle class="text md:text-xl font-semibold text-gray-900 mb-3"
            >Detalhes da Análise</CardTitle
          >
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible class="w-full">
            <AccordionItem
              v-for="(detail, index) in resultAnalysis.details"
              :key="index"
              :value="`item-${index}`"
            >
              <AccordionTrigger class="hover-elevate px-3 rounded-lg">
                <div
                  class="flex items-center justify-between w-full pr-3 gap-4"
                >
                  <span class="text-sm font-medium text-left">{{
                    detail.title
                  }}</span>
                  <Badge
                    :variant="
                      getScoreBadgeVariant(detail.score, detail.maxScore)
                    "
                    class="shrink-0"
                  >
                    {{ detail.score.toFixed(1) }}/{{ detail.maxScore }}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent class="px-3 pt-2 pb-4">
                <p class="text-sm text-muted-foreground leading-relaxed">
                  {{ detail.description }}
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Button
        @click="resetForm()"
        variant="outline"
        class="w-full mt-2"
        size="lg"
      >
        Analisar Novo Site
      </Button>
    </div>
  </div>
</template>

<style scoped></style>
