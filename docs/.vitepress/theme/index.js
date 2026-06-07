import DefaultTheme from 'vitepress/theme'
import { watch, nextTick, onMounted } from 'vue'
import { useRoute } from 'vitepress'
import mediumZoom from 'medium-zoom'
import './custom.css'

export default {
  extends: DefaultTheme,
  setup() {
    const route = useRoute()
    const initZoom = () => {
      mediumZoom('.vp-doc img:not(.no-zoom)', {
        background: 'rgba(0, 0, 0, 0.75)',
        margin: 16,
      })
    }
    onMounted(initZoom)
    watch(() => route.path, () => nextTick(initZoom))
  },
}
