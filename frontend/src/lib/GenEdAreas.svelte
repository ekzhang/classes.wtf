<script lang="ts">
  export let value: string[];
</script>

<div class="flex gap-1.5">
  {#each value as area (area)}
    <div class="border border-gray-600 text-[11px] font-medium px-1.5 py-0.5">
      {area}
    </div>
  {/each}
</div>
