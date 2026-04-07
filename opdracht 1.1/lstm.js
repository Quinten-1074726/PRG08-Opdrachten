// ------------------------
// LSTM class 
// ------------------------

export class LSTM {

    settings = {
        seqLen: 3,
        units: 16,
        epochs: 30
    }

    customSettings(settings) {
        this.settings = settings
    }

    //
    // Build and train model
    //
    async train(text) {
        //
        // length of text that gets looked at, ideally between 10 - 15 characters
        //
        const seqLen = this.settings.seqLen
        const chars = Array.from(new Set(text.split("")));
        const char2i = Object.fromEntries(chars.map((c, i) => [c, i]));
        const i2char = Object.fromEntries(chars.map((c, i) => [i, c]));
        const vocabSize = chars.length;

        // Prepare training sequences
        const X = [];
        const Y = [];
        for (let i = 0; i < text.length - seqLen; i++) {
            const seq = text.slice(i, i + seqLen).split("").map(c => char2i[c]);
            const nextChar = char2i[text[i + seqLen]];
            X.push(seq);
            Y.push(nextChar);
        }
        const N = X.length;

        // One-hot encode sequences: shape [N, seqLen, vocabSize]
        const xsArray = X.map(seq =>
            seq.map(idx => {
                const v = new Array(vocabSize).fill(0);
                v[idx] = 1;
                return v;
            })
        );
        const xs = tf.tensor3d(xsArray, [N, seqLen, vocabSize], 'float32');
        const ys = tf.tensor1d(Y, 'float32');

        // Build and train model
        const model = tf.sequential();
        model.add(tf.layers.lstm({
            inputShape: [seqLen, vocabSize],
            units: this.settings.units,
            kernelInitializer: 'glorotNormal',
            recurrentInitializer: 'glorotNormal'
        }));
        model.add(tf.layers.dense({ units: vocabSize, activation: 'softmax' }));
        model.compile({
            optimizer: tf.train.adam(0.01),
            loss: 'sparseCategoricalCrossentropy'
        });

        console.log("Training...");
        await model.fit(xs, ys, {
            epochs: this.settings.epochs,
            batchSize: 8,
            verbose: 0,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    const percent = Math.round(((epoch + 1) / 30) * 100);
                    console.log(`Training... ${percent}% (Epoch ${epoch + 1}/${this.settings.epochs}, loss=${logs.loss.toFixed(4)})`);
                }
            }
        });

        // Store settings needed for prediction
        this.settings = {
            model,
            seqLen,
            vocabSize,
            char2i,
            i2char
        };
        console.log("✅ Training finished");
    }

    //
    // een voorspelling doen
    //
    predictText(prompt, length=100) {
        const { model, seqLen, vocabSize, char2i, i2char } = this.settings;
        let seed = prompt.slice(0, seqLen);
        let generated = seed;
        for (let i = 0; i < length; i++) {
            const seq = seed.split("").map(c => {
                const v = new Array(vocabSize).fill(0);
                v[char2i[c]] = 1;
                return v;
            });
            const inputTensor = tf.tensor3d([seq], [1, seqLen, vocabSize], 'float32');
            const outputTensor = model.predict(inputTensor);
            const predIndex = outputTensor.argMax(-1).dataSync()[0];
            const nextChar = i2char[predIndex];
            generated += nextChar;
            seed = seed.slice(1) + nextChar;
            inputTensor.dispose();
            outputTensor.dispose();
        }
        return generated;
    }


    //
    // opslaan
    //
    async saveModel() {
        // save tensorflow
        await this.settings.model.save('downloads://language-model');

        // save settings
        const mappings = { seqLen: this.settings.seqLen, vocabSize: this.settings.vocabSize, char2i: this.settings.char2i, i2char: this.settings.i2char };
        const blob = new Blob([JSON.stringify(mappings, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'model-settings.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    //
    // laden
    //
    async loadModel() {
        // model laden
        console.log("Loading model...")
        const model = await tf.loadLayersModel('./language-model.json');

        // instellingen (seqLen, vocabSize, char2i, i2char) uit model-settings.json
        console.log("Loading settings...")
        const response = await fetch('./model-settings.json');
        const mappings = await response.json();
        this.settings = { model, ...mappings };

        console.log("Loading complete!");
    }


    // ------------------------
    // not used
    // temperature setting voor meer randomness, maar werkt alleen voor modellen met hoge seqLen en units
    // ------------------------
    predictTextWithTemperature(prompt, length = 100, temperature = 0.3) {
        const { model, seqLen, vocabSize, char2i, i2char } = this.settings;
        let seed = prompt.slice(0, seqLen);
        let generated = seed;
        const eps = 1e-8;
        for (let i = 0; i < length; i++) {
            const seq = seed.split("").map(c => {
                const v = new Array(vocabSize).fill(0);
                v[char2i[c]] = 1;
                return v;
            });
            const inputTensor = tf.tensor3d([seq], [1, seqLen, vocabSize], 'float32');
            const outputTensor = model.predict(inputTensor);
            const probs = Array.from(outputTensor.dataSync()); // raw probs

            // apply temperature
            const safeTemp = Math.max(1e-6, temperature);
            const adjusted = probs.map(p => Math.exp(Math.log(p + eps) / safeTemp));
            const sum = adjusted.reduce((a, b) => a + b, 0);
            const norm = adjusted.map(v => v / sum);

            // sample an index from the distribution
            let r = Math.random();
            let cum = 0;
            let predIndex = norm.length - 1;
            for (let j = 0; j < norm.length; j++) {
                cum += norm[j];
                if (r < cum) { predIndex = j; break; }
            }

            const nextChar = i2char[predIndex];
            generated += nextChar;
            seed = seed.slice(1) + nextChar;

            inputTensor.dispose();
            outputTensor.dispose();
        }
        return generated;
    }
}