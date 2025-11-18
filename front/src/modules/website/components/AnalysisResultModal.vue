<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

interface DetailItem {
  title: string;
  score: number;
  maxScore: number;
  description: string;
}

interface Config {
  rating: string;
  color: string;
  bgColor: string;
  icon: string;
  description: string;
}

interface Props {
  total: number;
  details: DetailItem[];
  config: Config;
  url: string;
}

defineProps<Props>();
defineEmits<{
  reset: [];
}>();

const getScoreBadgeVariant = (
  score: number,
  maxScore: number
): "default" | "secondary" => {
  const percentage = (score / maxScore) * 100;
  return percentage >= 75 ? "default" : "secondary";
};
</script>

<template>
  <div
    class="w-full max-w-3xl mx-auto overflow-y-auto max-h-[80vh]"
    data-testid="result-modal"
  >
    <Card class="w-auto bg-neutral-50 shadow-none border mb-6">
      <CardContent class="flex flex-col items-center justify-center p-6 sm:p-8">
        <div class="flex flex-col items-center justify-center space-y-6">
          <div
            :class="`flex h-36 w-36 items-center justify-center rounded-full ${config.bgColor}`"
            data-testid="rating-circle"
          >
            <div class="text-center">
              <div class="flex items-baseline justify-center gap-1 mb-2">
                <span
                  :class="`text-5xl font-bold ${config.color}`"
                  data-testid="total-score"
                >
                  {{ total }}
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
                data-testid="icon-check-circle"
              />
              <AlertCircle
                v-if="config.icon === 'AlertCircle'"
                color="blue"
                aria-hidden="true"
                data-testid="icon-alert-circle"
              />
              <AlertTriangle
                v-if="config.icon === 'AlertTriangle'"
                color="orange"
                aria-hidden="true"
                data-testid="icon-alert-triangle"
              />
              <XCircle
                v-if="config.icon === 'XCircle'"
                color="red"
                aria-hidden="true"
                data-testid="icon-x-circle"
              />

              <h2
                class="text-2xl font-bold"
                :class="config.color"
                data-testid="rating-label"
              >
                {{ config.rating }}
              </h2>
            </div>
            <p
              class="text-md text-muted-foreground max-w-md"
              data-testid="rating-description"
            >
              {{ config.description }}
            </p>
          </div>

          <Badge variant="secondary" class="text-xs">{{ url }}</Badge>
        </div>
      </CardContent>
    </Card>

    <Card class="w-full bg-neutral-50 shadow-none border mb-6">
      <CardHeader>
        <CardTitle class="text md:text-xl font-semibold text-gray-900 mb-3">
          Detalhes da Análise
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible class="w-full">
          <AccordionItem
            v-for="(detail, index) in details"
            :key="index"
            :value="`item-${index}`"
            :data-testid="`detail-item-${index}`"
          >
            <AccordionTrigger class="hover-elevate px-3 rounded-lg">
              <div class="flex items-center justify-between w-full pr-3 gap-4">
                <span class="text-sm font-medium text-left">{{
                  detail.title
                }}</span>
                <Badge
                  :variant="getScoreBadgeVariant(detail.score, detail.maxScore)"
                  class="shrink-0"
                  :data-testid="`score-badge-${index}`"
                  :aria-label="`${detail.title}: ${detail.score.toFixed(
                    1
                  )} de ${detail.maxScore}`"
                >
                  {{ detail.score.toFixed(1) }}/{{ detail.maxScore }}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent class="px-3 pt-2 pb-4">
              <p
                class="text-sm text-muted-foreground leading-relaxed"
                :data-testid="`detail-description-${index}`"
              >
                {{ detail.description }}
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>

    <Button
      @click="$emit('reset')"
      variant="outline"
      class="w-full mt-2"
      size="lg"
      data-testid="reset-button"
    >
      Analisar Novo Site
    </Button>
  </div>
</template>

<style scoped></style>
