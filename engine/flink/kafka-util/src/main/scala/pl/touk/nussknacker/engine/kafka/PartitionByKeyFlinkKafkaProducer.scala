package pl.touk.nussknacker.engine.kafka

import java.util.Properties

import org.apache.flink.streaming.connectors.kafka.{FlinkKafkaProducer, KafkaSerializationSchema}
import pl.touk.nussknacker.engine.kafka.KafkaEspUtils.withPropertiesFromConfig

object PartitionByKeyFlinkKafkaProducer {

  def apply[T](config: KafkaConfig,
               topic: String,
               serializationSchema: KafkaSerializationSchema[T],
               clientId: String,
               semantic: FlinkKafkaProducer.Semantic = FlinkKafkaProducer.Semantic.AT_LEAST_ONCE): FlinkKafkaProducer[T] = {
    val props = new Properties()
    props.setProperty("bootstrap.servers", config.kafkaAddress)
    props.setProperty("client.id", clientId)
    withPropertiesFromConfig(props, config)
    new FlinkKafkaProducer[T](topic, serializationSchema, props, semantic)
  }

}