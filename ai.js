const tf =require("@tensorflow/tfjs")
const tfnode =require("@tensorflow/tfjs-node")
const MODEL_CLASSES = {
    0: 'Fresh Apple',
    1: 'Fresh Banana',
    2: 'Fresh Orange',
    3: 'Rotten Apple',
    4: 'Rotten Banana',
    5: 'Rotten Orange'
  };

const MODEL_PATH = 'http://localhost:3000/model/model.json';
const IMAGE_SIZE = 150;
const CANVAS_SIZE = 224;
const TOPK_PREDICTIONS = 3;


processImage = async (image) => {
    return tf.tidy(() => image.expandDims(0).toFloat().div(127).sub(1));
  }




classifyLocalImage = async (buffer) => {
    try{
    
    const model = await tf.loadLayersModel(MODEL_PATH);  
    const image = tf.tidy( () => tfnode.node.decodeImage(buffer))

    // Process and resize image before passing in to model.
    const imageData = await processImage(image);
    console.debug("image is : ",imageData)
    //const resizedImage = tf.image.resizeBilinear(imageData, [IMAGE_SIZE, IMAGE_SIZE]);
  resizedImage=imageData
      
    const logits = model.predict(resizedImage);
    const probabilities = await logits.data();
    const preds = await getTopKClasses(probabilities, TOPK_PREDICTIONS);
    return preds

    // Dispose of tensors we are finished with.
    image.dispose();
    imageData.dispose();
    resizedImage.dispose();
    logits.dispose();
    }catch(err){
        console.debug(err)
    }
  }


  getTopKClasses = async (values, topK) => {
    const valuesAndIndices = [];
    for (let i = 0; i < values.length; i++) {
      valuesAndIndices.push({value: values[i], index: i});
    }
    valuesAndIndices.sort((a, b) => {
      return b.value - a.value;
    });
    const topkValues = new Float32Array(topK);
    const topkIndices = new Int32Array(topK);
    for (let i = 0; i < topK; i++) {
      topkValues[i] = valuesAndIndices[i].value;
      topkIndices[i] = valuesAndIndices[i].index;
    }

    const topClassesAndProbs = [];
    for (let i = 0; i < topkIndices.length; i++) {
      topClassesAndProbs.push({
        className: MODEL_CLASSES[topkIndices[i]],
        probability: (topkValues[i] * 100).toFixed(2)
      });
    }
    return topClassesAndProbs;
  }


  module.exports=classifyLocalImage